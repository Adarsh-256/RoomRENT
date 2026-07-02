require("dotenv").config();

const express= require("express");
const app = express();
const mongoose = require ("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./utiles/asyncwrap.js");
const ExpressError = require("./utiles/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
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
const dbUrl = process.env.ATLASDB_URL
console.log("dbUrl", dbUrl);


//to join ejs file
const path = require("path");
const { listingSchema } = require("./schema.js");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));                 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// cookies in session
const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7* 24 * 60 * 60 * 1000, //7 days 24 hours 60 min 60 sec 1000 ms
        maxAge: 7* 24 * 60* 60 * 1000,
        httptype:true,
}};
app.use(require("express-session")(sessionOptions));

//to connect mongoDB 
main()
.then(()=>{
    console.log("connected to mongoDB");
}).catch((err)=>{
    console.log("error connecting to mongoDB", err);
});
async function main(){  
    await mongoose.connect(dbUrl);
};


// to flash msgs
// app.use(session({
//     secret:process.env.SECRET,
//     resave:false,
//     saveUninitialized:true,
// }));

// Flash messages + authentication start
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Har EJS file me access karne ke liye currUser variable
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.delReview = req.flash("delReview");
    res.locals.delListings = req.flash("delListings");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// SEARCH ROUTE — keep it on top
app.get("/search", controllers.searchbar);

//signup route  
app.get("/signup",usercontrollers.signup);
app.post("/signup",usercontrollers.signupPost);

//login route
app.get("/login",usercontrollers.login);
app.post("/login",saveredirectUrl,usercontrollers.loginPost);

//index Route
app.get("/",controllers.listingindex);
app.get("/listings",controllers.listingindex)

app.post("/listings",isLoggedIn,upload.single("listing[image]"),validateListing, controllers.CreateListing);

//New Route
app.get("/listings/new",isLoggedIn,controllers.newListingForm);

//show route
app.get("/listings/:id",(controllers.showListing));

//Create  NEWRoute
app.post("/listings",validateListing,isLoggedIn, controllers.CreateListing);``

//Edit Route
app.get("/listings/:id/edit",isLoggedIn,isOwner, controllers.editListingForm);

//update Route  
app.put("/listings/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,controllers.updateListing);

//delete route
app.delete("/listings/:id",isLoggedIn,isOwner,controllers.deleteListing);

//Reviews-post Route
app.post("/listings/:id/reviews",validateReview,reviewcontrollers.postReview);

//delete review route
app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isreviewAuthor,reviewcontrollers.deleteReview);

//logout route
app.get("/logout",controllers.logout);

//to handle error 
app.all(/.*/,(req,res,next)=>{
  next(new ExpressError(404, " 404,Page not found!"));
});

app.listen(8080,()=>{
    console.log("server is listenning port 8080/listings");
});

// handle total error in one place
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { errMsg: message, statusCode });
});
