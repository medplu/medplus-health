const mongoose = require('mongoose');

// Time slot schema
const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true }   // Format: "HH:mm"
});

// Shift schema
const shiftSchema = new mongoose.Schema({
  shiftName: { type: String, required: true }, // Example: "Morning", "Afternoon"
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true },   // Format: "HH:mm"
  slots: { type: [timeSlotSchema], required: true } // Array of time slots
});

// Schedule schema
const scheduleSchema = new mongoose.Schema(
  {
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
    availability: { 
      type: Map, 
      of: [shiftSchema], // Map each date to an array of shifts
      required: true 
    },
    recurrence: { 
      type: String, 
      enum: ['none', 'daily', 'weekly'], 
      default: 'none' 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
