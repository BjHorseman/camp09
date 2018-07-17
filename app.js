var express      = require("express"),
    app          = express(),
    mongoose     = require("mongoose"),
    bodyParser   = require("body-parser"),
    Campground   = require("./models/campground"),
    Comment      = require("./models/comment"),
    seedDB       = require("./seed");


seedDB();
mongoose.connect("mongodb://localhost:27017/camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));


// Campground.create({
//     name: "bridge",
//     image:"https://images.unsplash.com/photo-1452796651103-7c07fca7a2c1?ixlib=rb-0.3.5&s=9fb418ae5136e50fa3ebe6ee01f7e5be&auto=format&fit=crop&w=1267&q=80",
//     description:"This is a bridge"
// },
// function(err,campground){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("newly created campgrounds:");
//         console.log(campground);
//     }}
// );

app.get("/",function(req,res){
   res.render("landing");
});
//index show all campgrounds
app.get("/campgrounds",function(req,res){
        //get all campgrounds from DB
        Campground.find({},function(err,allCampgrounds){
            if(err)
            {
                console.log(err);
            }else{
                res.render("campgrounds/index",{campgrounds:allCampgrounds});
            }
        });
        // res.render("campgrounds",{campgrounds:campgrounds});
});
 
//create add new campground to database
app.post("/campgrounds",function(req,res){
    //get data from form and add to campground array
    var name         = req.body.name; 
    var image        = req.body.image;
    var description  = req.body.description;
    var newCampgroun = {name:name, image:image, description: description};
    //create a new campground and save to DB
    Campground.create(newCampgroun,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//new -show form to create new campground
app.get("/campgrounds/new",function(req,res){
   res.render("campgrounds/new"); 
});

//show - shows more info about one campground
app.get("/campgrounds/:id",function(req,res){
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
//====================
//Comment route
//====================
app.get("/campgrounds/:id/comments/new",function(req,res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground: campground});
        }
        
    });
});
app.post("/campgrounds/:id/comments",function(req,res){
    //lookup campground using ID
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
           
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
    //create new comment
    //connect new comment to campground
    //redirect campground show page
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has started!");
});