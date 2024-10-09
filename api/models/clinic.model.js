// models/clinic_appointment.model.js
const mongoose = require('mongoose');

const clinicAppointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic', // Reference to the Clinic model
       
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed'],
        default: 'pending',
    },
    paymentId: {
        type: String,
        required: false, // Make paymentId optional
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('ClinicAppointment', clinicAppointmentSchema);