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
    images: [{ // Update to handle multiple images
        type: String,
        required: false,
    }],
    referenceCode: { // New field for the reference code
        type: String,
        required: true,
        unique: true, // Ensure reference code is unique
    },
    professionals: [{  // This allows multiple professionals to be attached to a clinic
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional'
    }],
    insuranceCompanies: [{ // New field for insurance companies
        type: String,
        required: true,
    }],
    specialties: {
        type: String,
        required: true,
    },
    education: { // Update to handle education as an object
        course: {
            type: String,
            required: true,
        },
        university: {
            type: String,
            required: true,
        },
    },
    experiences: [{ // Ensure experiences is an array of objects and required
        position: {
            type: String,
            required: true,
        },
        organization: {
            type: String,
            required: true,
        },
        startDate: {
            type: String,
            required: true,
        },
        endDate: {
            type: String,
            required: false,
        },
        currentlyWorking: {
            type: Boolean,
            required: false,
        },
    }],
    languages: {
        type: String,
        required: false,
    },
    assistantName: {
        type: String,
        required: false,
    },
    assistantPhone: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    certificateUrl: {
        type: String,
        required: false,
    },
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

// Create and export the 'Clinic' model
module.exports = mongoose.model('Clinic', clinicSchema);
