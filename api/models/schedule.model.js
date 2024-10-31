const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  slots: [
    {
      date: {
        type: Date,
        required: true,  // Specific date for the slot
      },
      startTime: {
        type: String,
        required: true,  // Example: '09:00 AM'
      },
      endTime: {
        type: String,
        required: true,  // Example: '10:00 AM'
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],
}, {
  timestamps: true,
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
