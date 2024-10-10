const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialties: {
        type: [String],
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
});

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    contactInfo: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    doctors: [doctorSchema],
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true,
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Clinic', clinicSchema);