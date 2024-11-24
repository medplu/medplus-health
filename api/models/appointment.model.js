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
    required: true,
  },
  patientId: { // Add patientId field to enable population
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  timeSlotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Schedule',
  },
  time: {
    type: String,
    required: true,
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

module.exports = Appointment;