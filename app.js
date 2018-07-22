var express      = require("express"),
    app          = express(),
    mongoose     = require("mongoose"),
    bodyParser   = require("body-parser"),
    Campground   = require("./models/campground"),
    Comment      = require("./models/comment"),
    flash        = require("connect-flash"),
    methodOverride = require("method-override"),
    passport     = require("passport"),
    LocalStrategy= require("passport-local"),
    User         = require("./models/user"),
    seedDB       = require("./seed"),
    env          = require('dotenv').config();
    
//requiring routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");


//seed the database
// seedDB();
app.locals.moment = require('moment');
app.use(flash());
// mongoose.connect("mongodb://localhost:27017/camp");
mongoose.connect("mongodb://Max:Ma612345@ds245901.mlab.com:45901/captainmaxfirstship");
 
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


//passport configuration
app.use(require("express-session")({
    secret:"max is greate",
    resave: false,
    saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});



app.use("/",indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has started!");
});