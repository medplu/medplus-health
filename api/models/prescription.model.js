const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true }, // URL of the uploaded document
  dateIssued: { type: Date, default: Date.now, required: true },
});

// Compile the schema into a model
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
