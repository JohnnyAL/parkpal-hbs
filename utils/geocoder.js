const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.CLIENT_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

function firstDup(s) {
  for (let char of s) {
    if (s.indexOf(char) !== s.lastIndexOf(char)) {
      return char;
    }
  }
}
