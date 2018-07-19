var express          = require("express"),
    router           = express.Router(),
    middleware       = require("../middleware/index.js"),
    Campground       = require("../models/campground");
    var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
    cloudinary.config({ 
      cloud_name: 'learntocodeinfo', 
      api_key:process.env.DB_USER, 
      api_secret: process.env.DB_PASS
});

//index show all campgrounds
router.get("/",function(req,res){
       
        //get all campgrounds from DB
        Campground.find({},function(err,allCampgrounds){
            if(err)
            {
                console.log(err);
            }else{
                res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser: req.user});
            }
        });
        // res.render("campgrounds",{campgrounds:campgrounds});
});
 
//create add new campground to database
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
   // add cloudinary url for the image to the campground object under image property
  req.body.campground.image = result.secure_url;
  // add author to campground
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  Campground.create(req.body.campground, function(err, campground) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.redirect('/campgrounds/' + campground.id);
  });
});
});

//Edit campground route
router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req, res) {
            Campground.findById(req.params.id,function(err,foundCampground){
            res.render("campgrounds/edit",{campground: foundCampground});
    });    
});


//update campground route

router.put("/:id",function(req,res){
    //find and update the correct campground
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground,function(err,updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
    //redirect somewhere(show page)
});

//new -show form to create new campground
router.get("/new",middleware.isLoggedIn,function(req,res){
   res.render("campgrounds/new"); 
});

//show - shows more info about one campground
router.get("/:id",function(req,res){
    //find the campground with provided Id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground ){
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            //render show template with taht campground
            res.render("campgrounds/show",{campground: foundCampground});
        }
    }); 
});

// destroy campground route
router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
   Campground.findByIdAndRemove(req.params.id,function(err){
       if(err){
           res.redirect("/campgrounds");
       }else{
           res.redirect("/campgrounds");
       }
   })
});

module.exports = router;