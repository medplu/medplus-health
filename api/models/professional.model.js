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
    consultationFee:{
        type: Number,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email is unique
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the base User model
        required: true
    },
    category: {
        type: String,
    },
    yearsOfExperience: {
        type: Number,
    },
    certifications: [String], // Array of certifications (optional)
    availability: {
        type: Boolean,
        default: false // Default to not available
    },
    slots: [
        {
            day: { type: String, required: false },  // Day of the week (e.g., 'Monday')
            time: { type: String, required: false }, // Time range (e.g., '10:00 AM - 11:00 AM')
            isBooked: { type: Boolean, default: false} // Whether the slot is booked or not
        }
    ]
}, { timestamps: true });

// Create and export the 'Professional' model
const Professional = mongoose.model('Professional', professionalSchema);

module.exports = Professional;
