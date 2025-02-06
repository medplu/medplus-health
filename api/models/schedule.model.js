const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  patientId: { // Add patientId field to enable population
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: false,
  },
  patientName: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'confirmed', 'in progress', 'done', 'completed', 'cancelled'], // Include all expected statuses
    default: 'pending',
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Schedule',
  },
  time: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  insurance: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

const scheduleSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  schedules: {
    type: Map,
    of: [{
      startTime: String,
      endTime: String,
      isAvailable: Boolean,
      isBookable: Boolean,
      recurrence: String,
      _id: mongoose.Schema.Types.ObjectId,
      slotId: mongoose.Schema.Types.ObjectId,
    }],
    required: true,
  },
}, {
  timestamps: true,
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = { Appointment, Schedule };
