const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },  // Relación con Room
  startDate: Date,
  endDate: Date,
  nights: Number,
  totalPrice: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
