const mongoose = require('mongoose');

// Define the subdocument schema for doctors
const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialties: {
    type: [String],
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
});

// Define the main schema for clinics
const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: true,
  },
  doctors: [doctorSchema], // Use the subdocument schema for doctors
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
}, {
  timestamps: true,
});

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;