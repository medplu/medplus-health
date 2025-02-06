const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
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
    required: false,
  },
  slots: [slotSchema], // Use a single array of slots
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
