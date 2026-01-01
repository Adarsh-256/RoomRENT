const Listing = require("./models/listing.js");
const ExpressError = require("./utiles/ExpressError.js");
const { listingSchema,reviewSchema } = require ("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You must be login  in first!!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveredirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
          delete req.session.redirectUrl; 
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
    let {id} = req.params;
    let listings = await Listing.findById(id);
    if(!listings.owner.equals(req.user._id)){
        req.flash("error","You don't have permission to do that,because you are not the owner of this listing!!");
        return res.redirect(`/listings/${id}`);
   }
 next();
}

//to handle server side error
module.exports.validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}


module.exports.validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isreviewAuthor = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review!!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}