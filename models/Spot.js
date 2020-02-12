const mongoose = require("mongoose");
const { Schema } = mongoose;

const spotSchema = new Schema({
  name: String,
  address: String, //long latt package --> make an array of 2 strings for long and latt
  description: String,
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
