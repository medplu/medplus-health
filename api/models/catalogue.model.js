const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Catalogue schema
const catalogueSchema = new Schema({
    pharmacy: {
        type: Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true
    },
    items: [{
        drugName: { type: String, required: true },
        stock: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: false },
        category: { type: String, required: true }
    }]
}, { timestamps: true });

// Create and export the 'Catalogue' model
const Catalogue = mongoose.model('Catalogue', catalogueSchema);

module.exports = Catalogue;
