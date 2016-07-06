var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    User            = require("./models/user"),
    passportLocalMongoose = require("passport-local-mongoose"),
    expressSession = require("express-session"),
    seedDB      = require("./seeds");
    
    
mongoose.connect("mongodb://localhost/yelp_camp_v3");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//seedDB();

app.use(expressSession({
    secret: "welcome mama",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride("_method"));

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next()
})


app.get("/", function(req, res){
    res.render("landing");
});

//INDEX - show all campgrounds
app.get("/campgrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("index",{campgrounds:allCampgrounds, currentUser: req.user});
       }
    });
});

//CREATE - add new campground to DB
app.post("/campgrounds", function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description  = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    console.log(req.user)
    var newCampground = {name: name, image: image, description: description, author: author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated)
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
app.get("/campgrounds/new", isLoggedIn, function(req, res){
   res.render("new.ejs"); 
});

// SHOW - shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("show", {campground: foundCampground});
        }
    });
})



//Edit Route

app.get("/campgrounds/:id/edit", checkOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            console.log(err)
        } else {
            res.render("edit", {campground:foundCampground})
            
        }
        
          
        
    })
    
})

//update route

app.put("/campgrounds/:id", checkOwnership, function(req, res){
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds")
            
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    } )
})

// Delete Route
app.delete("/campgrounds/:id", checkOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/campgrounds")
        } else {
            res.redirect("/campgrounds")
        }
        
        
    })

})


//===================
//comments section
//===================

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        } else {
            res.render("comments/new", {campground:campground})
            
        }
    })
    
})
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err)
                } else {
                    comment.author.id = req.user._id
                    comment.author.username = req.user.username
                    comment.save()

                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+ campground._id)
                }
            });
        }
    });
});

// comment edit
app.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back")
            
        } else {
            res.render("comment_edit", {campground_id:req.params.id, comment:foundComment})
        }
    })
    
})

//comment update
app.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log("back")
        } else {
            res.redirect("/campgrounds/"+ req.params.id)
        }
    })
})

// Delete comment

app.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back")
        } else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })

})
//=============

//========================================================
// Comments Ended
//==================================================

// Auth Routes 
//=============

app.get("/register", function(req, res){
    res.render("register")
})

app.post("/register", function(req, res){
    var newUser = new User({username:req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect("/register")
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect(req.session.returnTo || '/');
            delete req.session.returnTo
        })
        
    })
})

app.get("/login", function(req, res){
    res.render("login")
})
app.post("/login", passport.authenticate("local", 
    {successRedirect: "/campgrounds", 
    failureRedirect:"/login"}), function(req, res){
        
})
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/login")
})


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/login")
}

function checkOwnership(req, res, next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground) {
            if(err){
                res.redirect("back")
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next()
                } else {
                    res.redirect("back")
                }
            }
        })
        
    } else {
        res.redirect("back")
    }
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back")
            } else {
                if(foundComment.author.id.equals(req.user._id)){
                    next()
                } else {
                    res.redirect("back")
                }
            }
        })
        
    } else {
        res.redirect("/login")
    }
}







app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});