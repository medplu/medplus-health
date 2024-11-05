const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the professional-specific schema
const professionalSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email is unique
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',  // Reference to the base User model
        required: true
    },
    profession: {  // Add profession field to identify pharmacist, doctor, etc.
        type: String,
        required: false,
        enum: ['doctor', 'pharmacist', 'nurse', 'dentist'],  // Restrict to valid professions
    },
    category: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
    },
    certifications: [String],
    bio: {
        type: String,
        required: false
    },
    profileImage: {
        type: String,
        required: false
    },
    emailNotifications: {
        type: Boolean,
        default: false
    },
    pushNotifications: {
        type: Boolean,
        default: false
    },
    location: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        }
    },
    clinic: {  // Reference to the Clinic model
        type: Schema.Types.ObjectId,
        ref: 'Clinic',  // This ensures that a professional can be linked to a specific clinic
        default: null // Default to null when not attached to a clinic
    },
    attachedToClinic: {  // New field to track clinic attachment status
        type: Boolean,
        default: false // Initialize as false
    },
    pharmacy: {  // Reference to the Pharmacy model
        type: Schema.Types.ObjectId,
        ref: 'Pharmacy',  // This ensures that a professional can be linked to a specific pharmacy
        default: null // Default to null when not attached to a pharmacy
    },
    attachedToPharmacy: {  // New field to track pharmacy attachment status
        type: Boolean,
        default: false // Initialize as false
    }
}, { timestamps: true });

// Create and export the 'Professional' model
const Professional = mongoose.model('Professional', professionalSchema);
module.exports = Professional;
