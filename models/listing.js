const { required } = require("joi");
const mongoose = require("mongoose");


const listingSchema = new mongoose.Schema({
  title:{
    type: String, required: true
  },
  description: String,

  // ✅ Fix: image should be an object, not a string
  image: {
        url: String,
        filename:String,
  },

  price: Number,
  location: String,
  country: String,
  createdAt:{
    type:Date,
    default:Date.now
  },

  // 🌍 GEO LOCATION
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  }, 
  
  reviews:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  category:{
    type:String,
    required:true,
    enum:["beach","city","lakes","rooms","pools",""],
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
