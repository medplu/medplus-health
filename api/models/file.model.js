const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  // Add any other relevant fields
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);