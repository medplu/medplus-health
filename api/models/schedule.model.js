const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true },   // Format: "HH:mm"
});

const availabilitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  slots: [timeSlotSchema],
});

const scheduleSchema = new mongoose.Schema(
  {
    professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: false },
    availability: { type: Map, of: [timeSlotSchema], required: true },
    recurrence: { 
      type: String, 
      enum: ['none', 'daily', 'weekly'], 
      default: 'none' 
    }, // Recurrence pattern
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
