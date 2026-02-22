const Listing = require ("../models/listing.js");

module.exports.index =  async (req,res)=>{
   res.send("welcome to RoomRENT");
   
};

module.exports.searchbar = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.redirect("/listings");

    const listings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
   if(listings.length === 0){
    return res.render("search/notfound",{query});
   }
    res.render("index", {allListings: listings });
  } catch (err) {
    res.redirect("/listings");
  }
}


module.exports.listingindex = async (req, res) => {
  const { category } = req.query;
  let allListings;
  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }
  // 👇 yaha index route nahi, index.ejs render ho rahi hai
  res.render("index", { allListings });
};


module.exports.newListingForm = (req,res)=>{
     res.render("listings/Newroute.ejs")
};

module.exports.showListing = async(req,res)=>{
       let {id} = req.params;
       const listing = await Listing.findById(id)
       .populate("owner")
       .populate({
           path:"reviews",
            populate:{path:"author",
            },
            });
       if(!listing){
            req.flash("error", " Listing not found!!");
            return res.redirect("/listings");
       }
       console.log(listing.owner );
       return res.render("listings/show.ejs",{listing});
};

module.exports.CreateListing = async(req,res,next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.category = req.body.listing.category;
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        // 🔥 AUTOMATIC GEOLOCATION
        const location = req.body.listing.location; // user input location
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
            {
                headers: {
                    "User-Agent": "RoomRENT-App"  // REQUIRED by OpenStreetMap
                }
            }
        );
        const data = await response.json();
        if (!data.length) {
            req.flash("error", "Invalid location");
            return res.redirect("/listings/new");
        }
        newListing.geometry = {
            type: "Point",
            coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        };
        await newListing.save();
        req.flash("success", "New Listing Created successfully !!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

module.exports.editListingForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
         req.flash("error", " Listing not found!!");
         res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_600");
    res.render("listings/Edit.ejs", { listing, originalImageUrl }); 
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // 1️⃣ Find listing
    let listing = await Listing.findById(id);

    // 2️⃣ Update basic fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;
    listing.category = req.body.listing.category;

    // 3️⃣ 🔥 RE-GEOCODE location (MOST IMPORTANT)
    const location = req.body.listing.location;

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
        {
            headers: {
                "User-Agent": "RoomRENT-App"
            }
        }
    );

    const data = await response.json();

    if (data.length > 0) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(data[0].lon),
                parseFloat(data[0].lat)
            ]
        };
    }

    // 4️⃣ Update image if provided
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // 5️⃣ Save everything
    await listing.save();

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = (async(req,res)=>{
    let {id} = req.params;
    let deletedlisting= await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("delListings", "Listing deleted successfully");
    return res.redirect("/listings");
});

module.exports.logout = (req,res)=>{
     req.logout((err)=>{
        if(err){
            return next(err);
        }req.flash("success","logged out successfully");
        res.redirect("/listings");
})};