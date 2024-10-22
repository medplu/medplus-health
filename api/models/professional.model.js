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
        required: true,
        enum: ['doctor', 'pharmacist', 'nurse', 'other'],  // Restrict to valid professions
    },
    category: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
    },
    certifications: [String],
    slots: [
        {
            day: { 
                type: String, 
                required: true,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] // Restrict to valid days
            },  
            time: { 
                type: String, 
                required: true 
            }, 
            isBooked: { 
                type: Boolean, 
                default: false 
            }
        }
    ],
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
    }
}, { timestamps: true });

// Virtual field to determine availability based on slots
professionalSchema.virtual('isAvailable').get(function() {
    return this.slots.some(slot => !slot.isBooked);
});

// Create and export the 'Professional' model
const Professional = mongoose.model('Professional', professionalSchema);

module.exports = Professional;