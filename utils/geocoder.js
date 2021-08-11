const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "mapquest",
  httpAdapter: "https",
  apiKey: process.env.CLIENT_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;

function houseOfCards(floors) {
  if (Number.isInteger(floors) && floors >= 1) {
    let numOfCards = 2;
    let increase = 2;
    for (let i = 1; i <= floors; i++) {
      increase += 3;
      numOfCards += increase;
    }
    return numOfCards;
  } else {
    throw new Error("Error");
  }
}
