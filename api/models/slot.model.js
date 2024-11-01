const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Slot', slotSchema);
