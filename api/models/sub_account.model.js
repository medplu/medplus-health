const mongoose = require('mongoose');

const SubaccountSchema = new mongoose.Schema({
    business_name: { type: String, required: true },
    account_number: { type: String, required: true },
    percentage_charge: { type: Number, required: true, default: 10 }, // Default value of 10
    settlement_bank: { type: String, required: true },
    currency: { type: String, required: true },
    subaccount_code: { type: String, required: true },
    professional: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true }, // Reference to the Professional model
}, { timestamps: true });

const Subaccount = mongoose.model('Subaccount', SubaccountSchema);
module.exports = Subaccount;
