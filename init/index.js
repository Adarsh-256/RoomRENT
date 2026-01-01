const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/RoomRENT";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to mongoDB");

  // 🔥 INSERT AFTER CONNECTION
  await Listing.deleteMany({});
  initData.data = initData.map((obj)=> ({ ...obj,owner:"694cb2413ebf59e6b5da6e6f" })); // example owner ID
  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample data");

  mongoose.connection.close(); // optional but clean
}
 
main().catch(err => {
  console.log(err);
});
