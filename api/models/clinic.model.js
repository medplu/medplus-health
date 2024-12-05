const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Clinic Schema
const clinicSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  referenceCode: { // New field for the reference code
    type: String,
    required: true,
    unique: true, // Ensure reference code is unique
  },
  professionals: [{  // Reference to Professional model
    type: Schema.Types.ObjectId,
    ref: 'Professional',
  }],
  insuranceCompanies: [{ // New field for insurance companies
    type: String,
    required: true,
  }],
  specialties: {
    type: String,
    required: false,
  },
  education: { // Update to handle education as an object
    course: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
  },
  experiences: [{ // Ensure experiences is an array of objects and required
    position: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: false,
    },
    currentlyWorking: {
      type: Boolean,
      required: false,
    },
  }],
  languages: {
    type: String,
    required: false,
  },
  assistantName: {
    type: String,
    required: false,
  },
  assistantPhone: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  certificateUrl: {
    type: String,
    required: false,
  },
}, {
  timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

// Virtual field to fetch images related to professionals in the clinic
clinicSchema.virtual('clinicImages', {
  ref: 'ClinicImage', // Model to populate
  localField: 'professionals', // Field in Clinic model
  foreignField: 'professionalId', // Field in ClinicImage model that references the professional
  justOne: false, // This will return an array of images
});

// Ensure virtual fields are included in JSON output
clinicSchema.set('toObject', { virtuals: true });
clinicSchema.set('toJSON', { virtuals: true });

// Create and export the 'Clinic' model
module.exports = mongoose.model('Clinic', clinicSchema);
