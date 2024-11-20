const Pharmacy = require('../models/pharmacy.model');
const Professional = require('../models/professional.model');
const cloudinary = require('cloudinary').v2;

const generateReferenceCode = () => {
    return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const createPharmacy = async (req, res) => {
    try {
        const {
            name,
            contactNumber,
            email,
            street,
            city,
            state,
            postalCode, 
            operatingHours: rawOperatingHours,
            licenseNumber,
            insuranceCompanies,
            languages,
            assistantName,
            assistantPhone,
            image 
        } = req.body;

        const professionalId = req.params.professionalId;

        if (!professionalId) {
            return res.status(400).json({ error: 'Professional ID is required.' });
        }

        // Parse and validate operating hours
        let operatingHours = typeof rawOperatingHours === 'string' 
            ? JSON.parse(rawOperatingHours) 
            : rawOperatingHours;

        if (!operatingHours?.open || !operatingHours?.close) {
            return res.status(400).json({ error: 'Both opening and closing hours are required.' });
        }

        // Find and validate the professional
        const professional = await Professional.findById(professionalId);
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found.' });
        }

        if (professional.profession !== 'pharmacist') {
            return res.status(403).json({ error: 'Only pharmacists can create a pharmacy.' });
        }

        if (professional.attachedToPharmacy) {
            return res.status(400).json({ error: 'Professional is already attached to a pharmacy.' });
        }

        // Generate a unique reference code for the pharmacy
        const referenceCode = generateReferenceCode();

        // Create and save the pharmacy
        const pharmacy = new Pharmacy({
            name,
            contactNumber,
            email,
            address: { street, city, state, postalCode },
            pharmacists: [professional._id],
            operatingHours: {
                open: operatingHours.open,
                close: operatingHours.close
            },
            licenseNumber,
            image,
            referenceCode,
            insuranceCompanies,
            languages,
            assistantName,
            assistantPhone
        });

        const savedPharmacy = await pharmacy.save();

        // Update the professional
        professional.pharmacy = savedPharmacy._id;
        professional.attachedToPharmacy = true;
        await professional.save();

        return res.status(201).json({
            message: 'Pharmacy created successfully.',
            pharmacy: savedPharmacy
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while creating the pharmacy.'
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

const getPharmacyById = async (req, res) => {
    try {
        const pharmacy = await Pharmacy.findById(req.params.id);
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }
        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPharmacyByProfessionalId = async (req, res) => {
    try {
        const professional = await Professional.findById(req.params.professionalId);
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        const pharmacy = await Pharmacy.findOne({ pharmacists: professional._id });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        res.status(200).json(pharmacy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllPharmacies = async (req, res) => {
    try {
        const pharmacies = await Pharmacy.find();
        res.status(200).json(pharmacies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPharmacy,
    updatePharmacyLocation,
    getAllPharmacies ,
    getPharmacyById,
    getPharmacyByProfessionalId // Export the new controller
};