const Catalogue = require('../models/catalogue.model');
const Pharmacy = require('../models/pharmacy.model');
const cloudinary = require('cloudinary').v2;

// Add a new item to the catalogue
exports.addItem = async (req, res) => {
    try {
        const { pharmacyId, drugName, stock, price, category } = req.body;

        // Find or create the catalogue associated with the pharmacyId
        let catalogue = await Catalogue.findOne({ pharmacy: pharmacyId });
        if (!catalogue) {
            catalogue = new Catalogue({ pharmacy: pharmacyId, items: [] });
        }

        // Initialize imageUrl
        let imageUrl = '';
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageUrl = result.secure_url;
        }

        // Add the new item to the catalogue's items array
        catalogue.items.push({ drugName, stock, price, image: imageUrl, category });

        // Save the updated catalogue to the database
        await catalogue.save();

        // Send a success response with the updated catalogue
        res.status(201).json({ message: 'Item added successfully', catalogue });
    } catch (error) {
        // If an error occurs, send a 500 status with an error message
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update an item in the catalogue
exports.updateItem = async (req, res) => {
    try {
        const { pharmacyId, itemId, drugName, stock, price, category } = req.body;

        // Find the catalogue associated with the pharmacyId
        const catalogue = await Catalogue.findOne({ pharmacy: pharmacyId });
        if (!catalogue) {
            return res.status(404).json({ message: 'Catalogue not found' });
        }

        // Initialize imageUrl
        let imageUrl = '';
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            imageUrl = result.secure_url;
        }

        const updateFields = {
            'items.$.drugName': drugName,
            'items.$.stock': stock,
            'items.$.price': price,
            'items.$.category': category
        };

        if (imageUrl) {
            updateFields['items.$.image'] = imageUrl;
        }

        const updatedCatalogue = await Catalogue.findOneAndUpdate(
            { 'items._id': itemId, pharmacy: pharmacyId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedCatalogue) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully', updatedCatalogue });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete an item from the catalogue
exports.deleteItem = async (req, res) => {
    try {
        const { pharmacyId, itemId } = req.params;

        // Find the catalogue associated with the pharmacyId
        const catalogue = await Catalogue.findOneAndUpdate(
            { 'items._id': itemId, pharmacy: pharmacyId },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        if (!catalogue) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully', catalogue });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
