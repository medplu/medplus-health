const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  // Removed dayOfWeek as scheduling uses specific dates
  slots: [
    {
      _id: false,
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
    },
  ],
  timeZone: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
