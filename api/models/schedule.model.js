const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isBookable: {
    type: Boolean,
    default: true,
  },
  recurrence: {
    type: String,
    enum: ['None', 'Daily', 'Weekly'],
    default: 'None',
  },
});

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  schedules: {
    type: Map,
    of: [slotSchema],
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
