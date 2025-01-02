const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfessionalSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  specialty: { type: String, required: false },
  contactInfo: { type: String, required: false },
  bio: { type: String },
  clinicId: { type: Schema.Types.ObjectId, ref: 'Clinic' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  consultationFee: { type: Number },
  attachedToClinic: { type: Boolean, default: false },
  clinic_images: [{ type: Schema.Types.ObjectId, ref: 'ClinicImage' }],

  // Updated professionalDetails field
  professionalDetails: {
    medicalDegrees: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
      },
    ],
    specialization: { type: String },
    certifications: [{ type: String }],
    licenseNumber: { type: String },
    issuingMedicalBoard: { type: String },
    yearsOfExperience: { type: Number },
  },
}, { timestamps: true });

module.exports = mongoose.model('Professional', ProfessionalSchema);
