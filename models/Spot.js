const mongoose = require("mongoose");
const { Schema } = mongoose;

const spotSchema = new Schema({
  name: String,
  description: String,
  streetAddress: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  geoLocation: {
    longitude: Number,
    latitude: Number
  },
  size: {
    type: String,
    enum: ["Compact", "Midsized", "Large"]
  },
  type: {
    type: String,
    enum: ["Driveway", "Street", "Parking lot", "Garage"]
  },
  startDate: Date,
  endDate: Date,
  startTime: { type: Date, default: Date.now() },
  endTime: { type: Date, default: Date.now() },
  price: Number,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ]
});

const Spot = mongoose.model("Spot", spotSchema);

module.exports = Spot;
