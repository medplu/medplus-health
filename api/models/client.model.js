const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },  // Reference to the base User model
  doctors: [{ type: Schema.Types.ObjectId, ref: 'Professional' }],  // Array of doctor references
  image: String,  // Profile image URL
  gender: String,
  prescriptions: [String],
  diagnoses: [String],
  treatment: [String],
  labTests: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Client', clientSchema);