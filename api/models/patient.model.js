const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    medicalHistory: {
        type: [String], // Change to array of strings
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
