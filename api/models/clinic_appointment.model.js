const mongoose = require('mongoose');

const clinicAppointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
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
    notes: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('ClinicAppointment', clinicAppointmentSchema);