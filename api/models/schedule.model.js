const mongoose = require('mongoose');

const breakSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

const shiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  durationOfConsultation: { type: Number, required: true, default: 60 },
  breaks: [breakSchema],
  date: { type: String, required: true },
  timeSlots: [{ start: String, end: String }],
});

const scheduleSchema = new mongoose.Schema({
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  availability: { type: Map, of: [shiftSchema], required: true },
  recurrence: { type: String, default: 'None' },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
