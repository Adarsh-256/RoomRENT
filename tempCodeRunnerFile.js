const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn,isOwner,validateListing,validateReview ,isreviewAuthor} = require ("./middleware.js");
const { saveredirectUrl } = require ("./middleware.js");
const controllers = require("./controllers/listing.js");
const usercontrollers = require("./controllers/user.js");
const reviewcontrollers = require("./controllers/review.js");
const multer= require("multer");
const { storage } = require ("./cloudinaryconfig.js");
const upload = multer({ storage });
const Listing = require ("./models/listing.js");


//to join ejs files
const path = require("path");
const { listingSchema } = require("./schema.js");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));                 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);

//to connect mongoDB 
main()
.then(()=>{
    console.log("connected to mongoDB");
}).catch((err)=>{
    console.log("error connecting to mongoDB", err);
});
async function main(){  
    await mongoose.connect("mongodb://127.0.0.1:27017/RoomRENT");
};

// to flash msgs
app.use(session({
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.delReview = req.flash("delReview");
    res.locals.delListings = req.flash("delListings");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});
