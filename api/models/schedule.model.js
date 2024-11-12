const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Ensure each slot has a unique ObjectId
  },
  date: {
    type: Date,
    required: true,  // Specific date for the slot
  },
  startTime: {
    type: String,
    required: true,  // e.g., '09:00 AM'
  },
  endTime: {
    type: String,    // Ensure this is a String
    required: true,  // e.g., '10:00 AM'
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment', 
    default: null,
  },
});

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  slots: [slotSchema],
  timeZone: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
