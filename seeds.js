var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data = [
    {
        name:"Cloud resting",
        image:"https://c.tadst.com/gfx/750w/sunrise-sunset-sun-calculator.jpg",
        description:"Beutiful floers all over"
        
    },
    {
        name:"crowd",
        image:"http://unisci24.com/data_images/wlls/13/215050-crowd.jpg",
        description:"Too much crows bad for noise"
        
    },
    {
        name:"new zeal",
        image:"http://modelearthlandscapes.com/data_images/countries/new-zealand/new-zealand-13.jpg",
        description:"New Zealand..a beautiful and calm and serene place"
        
    }
    
    ]


function seedDB(){
   //Remove all campgrounds
   Campground.remove({}, function(err){
        // if(err){
        //     console.log(err);
        // }
        // console.log("removed campgrounds!");
        // data.forEach(function(seed){
        //     Campground.create(seed, function(err, campground){
        //         if(err){
        //             console.log(err)
        //         } else {
        //             console.log("added Campground");
        //             Comment.create({text:"This is unbearable", author: "martin"}, function(err, comment){
        //                 if(err){
        //                     console.log(err)
        //                 } else {
                            
        //                     campground.comments.push(comment);
        //                     campground.save();
        //                     console.log("comment too added")
        //                 }
        //             })
                    
        //         }
                
        //     })
            
        // })
       
   });
   
    
}
        
        
module.exports = seedDB;
