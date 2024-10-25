const mongoose = require('mongoose');

// Define the clinic schema
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
        required: false, // Change this to false to make the image optional
    },
    category: {
        type: String,
        required: true,
    },
    referenceCode: { // New field for the reference code
        type: String,
        required: true,
        unique: true, // Ensure reference code is unique
    },
    professionals: [{  // This allows multiple professionals to be attached to a clinic
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional'
    }],
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

// Create and export the 'Clinic' model
module.exports = mongoose.model('Clinic', clinicSchema);
