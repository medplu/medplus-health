// Import necessary models
const Pharmacy = require('../models/pharmacy.model');
const Professional = require('../models/professional.model');
const cloudinary = require('cloudinary').v2;

// Controller to create a pharmacy (only pharmacists can create pharmacies)
const createPharmacy = async (req, res) => {
    try {
        const {
            name,
            contactNumber,
            email,
            street,
            city,
            state,
            zipCode,
            operatingHours, // Expecting an object with open and close properties
            services,
            licenseNumber,
            professionalId  // ID of the professional creating the pharmacy
        } = req.body;

        let image = null;

        if (req.files && req.files.image) {
            const file = req.files.image;
            const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'pharmacies',
            });
            image = uploadedResponse.secure_url;
        }

        // Find the professional by ID
        const professional = await Professional.findById(professionalId);

        // Check if the professional exists and if they are a pharmacist
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        if (professional.profession !== 'pharmacist') {
            return res.status(403).json({ error: 'Only pharmacists can create a pharmacy' });
        }

        // Check if the professional is already attached to a pharmacy
        if (professional.attachedToPharmacy) {
            return res.status(400).json({ error: 'Professional is already attached to a pharmacy' });
        }

        // Create a new pharmacy without location and inventory
        const pharmacy = new Pharmacy({
            name,
            contactNumber,
            email,
            address: {
                street,
                city,
                state,
                zipCode
            },
            pharmacists: [professional._id],  // Link the pharmacist to the pharmacy
            operatingHours, // Use the object directly
            services,
            licenseNumber,
            image
        });

        // Save the pharmacy to the database
        const savedPharmacy = await pharmacy.save();

        // Update the professional to be attached to the new pharmacy
        const updatedProfessional = await Professional.findOneAndUpdate(
            { _id: professionalId },
            {
                pharmacy: savedPharmacy._id, // Link the pharmacy ID to the professional's pharmacy field
                attachedToPharmacy: true // Set attachedToPharmacy to true
            },
            { new: true } // Return the updated document
        );

        if (!updatedProfessional) {
            console.warn(`No professional found for ID: ${professionalId}`);
        }

        // Send a success response
        return res.status(201).json({
            message: 'Pharmacy created successfully',
            pharmacy: savedPharmacy
        });
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while creating the pharmacy'
        });
    }
};

// Controller to update the location of a pharmacy
const updatePharmacyLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        // Validate required fields
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const pharmacy = await Pharmacy.findByIdAndUpdate(
            req.params.id,
            { location: { latitude, longitude } },
            { new: true, runValidators: true }
        );

        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Controller to update the inventory of a pharmacy
const updatePharmacyInventory = async (req, res) => {
    try {
        const { inventory } = req.body;

        // Validate required fields
        if (!inventory) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const pharmacy = await Pharmacy.findByIdAndUpdate(
            req.params.id,
            { inventory },
            { new: true, runValidators: true }
        );

        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPharmacy,
    updatePharmacyLocation,
    updatePharmacyInventory
};