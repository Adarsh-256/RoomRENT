const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// plugin goes on SCHEMA
UserSchema.plugin(passportLocalMongoose);

// create model AFTER plugin
module.exports = mongoose.model("User", UserSchema);

