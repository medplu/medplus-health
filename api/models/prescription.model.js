import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient: {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
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
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    contact: {
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
  },
  warnings: { type: String, required: false }, // any additional warnings
});

// Compile the schema into a model
const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;