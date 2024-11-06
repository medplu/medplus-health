const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient: {
    name: { type: String, required: false }, // changed to optional
    dob: { type: Date, required: false }, // changed to optional
    weight: { type: Number, required: false }, // weight in kg, optional
  },
  dateIssued: { type: Date, default: Date.now, required: true },
  medication: [
    {
      drugName: { type: String, required: true },
      strength: { type: String, required: true }, // e.g., "500 mg"
      dosageForm: { type: String, required: true }, // e.g., "tablet", "capsule"
      quantity: { type: Number, required: true }, // total quantity to dispense
    },
  ],
  instructions: {
    dosageAmount: { type: String, required: true }, // e.g., "1 tablet"
    route: { type: String, required: true }, // e.g., "orally", "topically"
    frequency: { type: String, required: true }, // e.g., "every 8 hours"
    duration: { type: String, required: true }, // e.g., "for 7 days"
    additionalInstructions: { type: String, required: false }, // e.g., "Take with food"
  },
  refills: { type: Number, default: 0 }, // number of refills allowed
  prescriber: {
    name: { type: String, required: false }, // changed to optional
    licenseNumber: { type: String, required: false }, // changed to optional
    contact: {
      phone: { type: String, required: false }, // changed to optional
      address: { type: String, required: false }, // changed to optional
    },
  },
  warnings: { type: String, required: false }, // any additional warnings
});

// Compile the schema into a model
const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
