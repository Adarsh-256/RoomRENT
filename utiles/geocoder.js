const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap", // ✅ FREE
};

module.exports = NodeGeocoder(options);
