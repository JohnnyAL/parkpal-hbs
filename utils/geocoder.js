const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.CLIENT_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

function narcissistic(value) {
  let string = value.toString().split("");
  let result = string.reduce((accum, currVal) => {
    return accum + Math.pow(currVal, string.length);
  }, 0);

  return result === value;
}
