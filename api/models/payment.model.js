const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: 'KSH'  // Default to Nigerian Naira, or change to any other currency
    },
    payment_method: {
        type: String,
        default: 'card'  // Default method could be card; this could store values like 'bank', 'ussd', etc.
    },
    metadata: {
        type: Object,
        default: {}
    },
    transaction_fee: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true // Automatically creates `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('PaymentModel', paymentSchema);
