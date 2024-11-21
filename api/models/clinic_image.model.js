const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  urls: [{
    type: String,
    required: true,
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
});

module.exports = mongoose.model('ClinicImage', ImageSchema);