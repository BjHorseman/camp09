//all the middleare goes here
var Campground = require("../models/campground.js");
var Comment = require("../models/comment.js");
var middlewareObj = {
    checkCampgroundOwnership: function(){
        
    }
};


middlewareObj.checkCampgroundOwnership = function(req, res, next){
     if(req.isAuthenticated()){
                Campground.findById(req.params.id,function(err,foundCampground){
                if(err){
                    req.flash("error", "campground not found");
                    res.redirect("back");
                }else{
                    //does user own the campground?
                   
                    if(foundCampground.author.id.equals(req.user._id))
                    {
                        next();
                    }
                    else{
                        req.flash("error", "you don't have permission to do that ");
                        res.redirect("back");
                    }
                }
                });    
        }else{
            req.flash("error", "you need to be logged in to do that");
           res.redirect("back");
        }
}



middlewareObj.checkCommentOwnership = function(req, res, next){
     if(req.isAuthenticated()){
                Comment.findById(req.params.comment_id,function(err,foundComment){
                if(err){
                   res.redirect("back");
                }else{
                    //does user own the cooment?
                    if(foundComment.author.id.equals(req.user._id))
                    {
                        next();
                    }
                    else{
                        req.flash("error","You don't have permsission to do that");
                        res.redirect("back");
                    }
                }
                });    
        }else{  
            req.flash("error","you need to be logged in");
            res.redirect("back");
        }
}
//middleware
middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","Please Login First");
    res.redirect("/login");
}

module.exports = middlewareObj