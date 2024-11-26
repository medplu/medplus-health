const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the rider-specific schema
const riderSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the base User model
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['motorcycle', 'bicycle'],
        required: true
    },
    vehicleRegistrationNumber: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: false // Change this line to make gender optional
    }
});

// Create and export the 'Rider' model
const Rider = mongoose.model('Rider', riderSchema);

module.exports = Rider;
