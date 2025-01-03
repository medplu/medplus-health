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
        street: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        zipCode: { type: String, required: false }
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
    catalogue: {
        type: Schema.Types.ObjectId,
        ref: 'Catalogue',
        required: false
    },
    inventory: [{
        drugName: { type: String, required: true },
        stock: { type: Number, required: true }
    }],
    operatingHours: {
        open: { type: String, required: true },
        close: { type: String, required: true }
    },
    licenseNumber: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    referenceCode: {
        type: String,
        required: true,
        unique: true
    },
    insuranceCompanies: [{
        type: String,
        required: false
    }],
    languages: {
        type: String,
        required: false
    },
    assistantName: {
        type: String,
        required: false
    },
    assistantPhone: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Create and export the 'Pharmacy' model
const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

module.exports = Pharmacy;