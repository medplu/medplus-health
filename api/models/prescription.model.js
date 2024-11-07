const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  dateIssued: { type: Date, default: Date.now, required: true },
  medication: [
    {
      drugName: { type: String, required: true },
      strength: { type: String, required: true }, // e.g., "500 mg"
      frequency: { type: String, required: true }, // e.g., "every 3 hours"
      duration: { type: String, required: true }, // e.g., "for 7 days"
    },
  ],
});

// Compile the schema into a model
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
