const mongoose = require('mongoose');

// Time slot schema
const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true },   // Format: "HH:mm"
});

// Shift schema, which includes time slots for each shift
const shiftSchema = new mongoose.Schema({
  shiftName: { type: String, required: true },   // Example: "Morning", "Afternoon"
  startTime: { type: String, required: true },   // Format: "HH:mm"
  endTime: { type: String, required: true },     // Format: "HH:mm"
  slots: [timeSlotSchema],                       // Array of time slots for the shift
});

// Availability schema, which groups shifts by date
const availabilitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  shifts: [shiftSchema],                  // Array of shifts on that date
});

// Schedule schema, which contains a professional's availability
const scheduleSchema = new mongoose.Schema(
  {
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: false },
    availability: { 
      type: Map, 
      of: [availabilitySchema], // Map of availability by date, each with multiple shifts
      required: true 
    },
    recurrence: { 
      type: String, 
      enum: ['none', 'daily', 'weekly'], 
      default: 'none' // Recurrence pattern
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
