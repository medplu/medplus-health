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
            latitude,
            longitude,
            inventory,
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

        // Create a new pharmacy
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
            location: {
                latitude,
                longitude
            },
            pharmacists: [professional._id],  // Link the pharmacist to the pharmacy
            inventory,
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

module.exports = {
    createPharmacy
};
