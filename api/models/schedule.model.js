const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  slots: [
    {
      time: {
        type: String,
        required: true,  // Example: '09:00 AM - 10:00 AM'
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
