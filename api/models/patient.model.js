const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: false
    },
    dateOfBirth: {
        type: Date, // You can store it as a Date type
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    address: {
        street: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        postalCode: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        }
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    profilePicture: {
        type: String, // Assuming this is a URL or file path to the image
        required: false
    },
    emergencyContact: {
        name: {
            type: String,
            required: false
        },
        relationship: {
            type: String,
            required: false
        },
        phone: {
            type: String,
            required: false
        }
    },
    medicalHistory: {
        type: [String], // Array of strings for medical history
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
