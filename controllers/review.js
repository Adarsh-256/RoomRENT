const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.postReview = (async (req,res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review added");
    console.log("new review saved");
    //res.send("New Review saved successfully");
    res.redirect(`/listings/${listing._id}`);
});

module.exports.deleteReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("delReview", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
};