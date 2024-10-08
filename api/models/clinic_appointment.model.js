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
        required: true,
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

// Export the model with the name 'ClinicAppointment'
module.exports = mongoose.model('ClinicAppointment', clinicAppointmentSchema);
