// Import necessary models
const Pharmacy = require('../models/pharmacy.model');
const Professional = require('../models/professional.model');

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
            operatingHours,
            services,
            licenseNumber,
            professionalId  // ID of the professional creating the pharmacy
        } = req.body;

        // Find the professional by ID
        const professional = await Professional.findById(professionalId);

        // Check if the professional exists and if they are a pharmacist
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        if (professional.profession !== 'pharmacist') {
            return res.status(403).json({ error: 'Only pharmacists can create a pharmacy' });
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
            operatingHours,
            services,
            licenseNumber
        });

        // Save the pharmacy to the database
        const savedPharmacy = await pharmacy.save();

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