const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfessionalSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    profession: { type: String, required: true },
    title: { type: String },
    consultationFee: { type: Number, default: 5000 },
    category: { type: String },
    yearsOfExperience: { type: Number },
    certifications: { type: [String] },
    bio: { type: String },
    profileImage: { type: String },
    location: { type: String },
    attachedToClinic: { type: Boolean },
    attachedToPharmacy: { type: Boolean, default: false },
    clinicId: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
        required: false // Make clinicId optional
    },
    clinicReferenceCode: { type: String }, // Add this field
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProfessionalSchema.virtual('clinic_images', {
  ref: 'ClinicImage',
  localField: '_id',
  foreignField: 'professionalId'
});

ProfessionalSchema.set('toObject', { virtuals: true });
ProfessionalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Professional', ProfessionalSchema);
