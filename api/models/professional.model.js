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
  profileImage: { type: String },
  consultationFee: { type: Number },
  availability: [{ type: String }],
  slots: [{
    day: { type: String },
    startTime: { type: String },
    endTime: { type: String },
    isBooked: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Professional', ProfessionalSchema);
