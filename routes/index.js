var express         = require("express"),
    router          = express.Router(),
    passport        = require("passport"),
    async           = require("async"),
    nodemailer      = require("nodemailer"),
    Campground      = require("../models/campground"),
    crypto          = require("crypto"),
    User            = require("../models/user");

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
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        });
    // eval(require('locus'));
    // //admin set up
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

router.post('/forgot',function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20,function(err,buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token,done){
           User.findOne({email:req.body.email},function(err, user){
                if(!user){
                    req.falsh('error','No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour
                
                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token,user,done){
            var smtpTransport = nodemailer.createTransport({
                service:"Gmail",
                auth:{
                    user: 'CaptainCode123@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions={
                to:user.email,
                from:'CaptainCode123@gmail.com',
                subject:'Node.js Password Reset',
                text:'You are receiving this because you ( or someon else) have requested the reset of the password'+
                'please click on the following link, or paste this into your browser to complete the process'+
                'http://' + req.headers.host +'/reset'+token+'\n\n'+
                'If you did not reqest this, please ingore this email and your password will remain unchange'
            };
            smtpTransport.sendMail(mailOptions,function(err){
                console.log('mail send');
                req.flash('success', 'An email has been sent to ' + user.email +' with further instructions.');
                done(err,'done');
            });
        }
        ],
        function(err){
            if(err)return next(err);
            res.redirect('/forgot');
        });
});

router.get('/reset/:token',function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{$gt: Date.now()}},function(err,user){
        if(!user){
            req.flash('error','Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset',{token:req.params.token});
    });
});

router.post('/reset/:token',function(req,res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{$gt: Date.now()}},function(err,user){
                if(!user){
                    req.flash('error','Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password,function(err){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err){
                            req.logIn(user,function(err){
                                done(err,user);
                            });
                        });
                    });
                }else{
                    req.flash('error','passwords do not match.');
                    return res.redirect('back');
                }
        });
},function(user,done){
    var smtpTransport = nodemailer.createTransport({
        service:'Gmail',
        auth:{
            user :'CaptainCode123@gmail.com',
            pass:process.env.GMAILPW
        }
    });
    var mailOptions = {
        to: user.email,
        from:'lCaptainCode123@gmail.com',
        subject:'Your password has been changed',
        text:'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email+'has'
    };
    smtpTransport.sendMail(mailOptions,function(err){
        req.flash('success','Success! your password has been changed.');
        done(err);
    });
}
],function(err){
    res.redirect('/campgrounds');
    });
});
//user profile
router.get("/users/:id",function(req,res){
   User.findById(req.params.id,function(err,foundUser){
       if(err){
           req.flash("error","Something went wrong");
           res.redirect("/");
       }
       Campground.find().where("author.id").equals(foundUser._id).exec(function(err,campgrounds){
          if(err){
           req.flash("error","Something went wrong");
           res.redirect("/");
       }
       
       res.render("users/show",{user: foundUser, campgrounds:campgrounds});
    }); 
   });
});


module.exports = router;