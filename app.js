var express      = require("express"),
    app          = express(),
    mongoose     = require("mongoose"),
    bodyParser   = require("body-parser"),
    Campground   = require("./models/campground");



mongoose.connect("mongodb://localhost:27017/camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");


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
                res.render("index",{campgrounds:allCampgrounds});
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
   res.render("new.ejs"); 
});

//show - shows more info about one campground
app.get("/campgrounds/:id",function(req,res){
    //find the campground with provided Id
    Campground.findById(req.params.id, function(err,foundCampground ){
        if(err){
            console.log(err);
        }else{
            //render show template with taht campground
            res.render("show",{campground: foundCampground});
        }
    }); 
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has started!");
})