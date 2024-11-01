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
  patientName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  timeSlotId: { // New field to reference the selected time slot
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Schedule.slots', // Reference to the slot within Schedule
  },
  time: { // New field to store the time range of the slot
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;