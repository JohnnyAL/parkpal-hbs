const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.CLIENT_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

function groupByCommas(n) {
  let str = n.toString();
  if (str.length < 4) {
    return str;
  } else {
    let arr = str.split("").reverse();
    for (let i = 2; i < arr.length; i += 3) {
      arr.splice(i, 1, "," + arr[i]);
    }
    return arr.reverse().join("");
  }
}
