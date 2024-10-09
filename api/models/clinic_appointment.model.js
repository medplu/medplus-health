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
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment', // Updated reference to match the model name
        required: false, // Make paymentId optional
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

// Check if the model already exists before defining it
const ClinicAppointment = mongoose.models.ClinicAppointment || mongoose.model('ClinicAppointment', clinicAppointmentSchema);

module.exports = ClinicAppointment;