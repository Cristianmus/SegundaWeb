const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Asegura que el nombre de la habitación es obligatorio
  },
  type: {
    type: String,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true, // Asume que la habitación está disponible por defecto
  },
  features: [String],
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
