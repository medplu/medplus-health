const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Pharmacy schema
const pharmacySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    location: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
    },
    pharmacists: [{
        type: Schema.Types.ObjectId,
        ref: 'Professional',  // Reference to the Professional model (pharmacists)
        required: true
    }],
    inventory: [{
        drugName: { type: String, required: true },
        stock: { type: Number, required: true }
    }],
    operatingHours: [{
        day: { type: String, required: true },  // e.g., 'Monday'
        openTime: { type: String, required: true },  // e.g., '08:00 AM'
        closeTime: { type: String, required: true }  // e.g., '06:00 PM'
    }],
    services: [String],  // Array of pharmacy services (e.g., 'Delivery', 'Consultation')
    licenseNumber: {
        type: String,
        required: true  // Required to verify the pharmacy
    }
}, { timestamps: true });

// Create and export the 'Pharmacy' model
const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;