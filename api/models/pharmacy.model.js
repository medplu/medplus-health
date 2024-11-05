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
        ref: 'Professional',
        required: true
    }],
    inventory: [{
        drugName: { type: String, required: true },
        stock: { type: Number, required: true }
    }],
    operatingHours: {
        open: { type: String, required: true },
        close: { type: String, required: true }
    },
    services: [String],
    licenseNumber: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Create and export the 'Pharmacy' model
const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;