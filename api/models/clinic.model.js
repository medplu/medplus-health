const mongoose = require('mongoose');

const WorkingDaySlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
});

const WorkingDaysSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
  },
  slots: [WorkingDaySlotSchema],
});

const ClinicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  practiceName: {
    type: String,
    required: true,
  },
  practiceLocation: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  workingDays: {
    type: [WorkingDaysSchema],
    required: true,
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
  },
  services: [
    {
      type: String,
      required: true,
    },
  ],
  amenities: [
    {
      type: String,
    },
  ],
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  licenseNumber: {
    type: String,
    required: true,
  },
  accreditation: {
    type: String,
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  ],
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
  emergencyServices: {
    type: Boolean,
    default: false,
  },
  experience: [
    {
      institution: String,
      year: String,
      roles: String,
      notableAchievement: String,
    },
  ],
  insuranceProviders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsuranceProvider',
    },
  ],
}, {
  timestamps: true,
});

const Clinic = mongoose.model('Clinic', ClinicSchema);

module.exports = Clinic;
