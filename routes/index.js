var express         = require("express"),
router              = express.Router(),
passport            = require("passport"),
// async               = require("async"),
// nodemailer          = require("nodemailer"),
User                = require("../models/user");

//root route
router.get("/",function(req,res){
   res.render("landing");
});

//================
//auth routes
//================
//register form
router.get("/register",function(req,res){
    res.render("register");
});
//handle the sign up logic
router.post("/register",function(req,res){
    var newUser = new User({username: req.body.username});
    //admin set up
    if(req.body.adminCode === 'Captain612345'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password,function(err,user){
           if(err){
        console.log(err);
        return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login",function(req,res){
    
    res.render("login");
});
//login form logic
router.post("/login",passport.authenticate("local",
{
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
  
}),function(req,res){
});
//logout route
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out!");
    res.redirect("/campgrounds");
});

//forgot password
router.get("/forgot",function(req,res){
    res.render("forgot");
});



module.exports = router;