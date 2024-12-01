const Professional = require('../models/professional.model');
const mongoose = require('mongoose'); // Import mongoose
const cloudinary = require('cloudinary').v2; // Make sure cloudinary is properly configured
// Fetch all professionals with only userId and clinicId populated as IDs
exports.getProfessionals = async (req, res) => {
    try {
        // Fetch all professionals but populate only userId and clinicId (as ObjectId)
        const professionals = await Professional.find()
            .select('-user -clinicId') // Exclude user and clinicId fields from the response
            .populate('user', '_id')   // Populate user field with only its _id
            .populate('clinicId', '_id'); // Populate clinicId field with only its _id

        console.log("Fetched professionals:", professionals);
        res.status(200).json(professionals);
    } catch (error) {
        console.log("Error fetching professionals", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Fetch a single professional by doctorId (_id) with userId and clinicId as ObjectIds
exports.getProfessionalById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Fetch a single professional and return userId and clinicId as ObjectIds
        const professional = await Professional.findById(doctorId)
            .select('-user -clinicId') // Exclude user and clinicId fields
            .populate('user', '_id')   // Populate user field with only _id
            .populate('clinicId', '_id'); // Populate clinicId field with only _id

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        res.status(200).json(professional);
    } catch (error) {
        console.error("Error fetching professional:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Fetch a professional by userId, with userId and clinicId as ObjectIds
exports.getProfessionalByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching professional with userId: ${userId}`);

        // Fetch professional by userId and return userId and clinicId as ObjectIds
        const professional = await Professional.findOne({ user: userId })
            .select('-user -clinicId') // Exclude user and clinicId fields
            .populate('user', '_id')   // Populate user field with only _id
            .populate('clinicId', '_id'); // Populate clinicId field with only _id

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        res.status(200).json(professional);
    } catch (error) {
        console.error("Error fetching professional:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getProfessionalById = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const professional = await Professional.findById(doctorId).populate('clinicId'); // Populate clinicId

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        res.status(200).json(professional);
    } catch (error) {
        console.error("Error fetching professional:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




exports.updateProfile = async (req, res) => {
    const { professionalId } = req.params; // Get the professional ID from the request parameters
    const { consultationFee, availability } = req.body; // Get the consultation fee and availability from the request body

    // Log the professionalId for debugging
    console.log('Updating profile for professionalId:', professionalId);

    try {
        // Check if professional exists
        const professional = await Professional.findById(professionalId);
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        // Handle profile image upload if provided
        if (req.files && req.files.profileImage) { // Check for uploaded file correctly
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.files.profileImage.tempFilePath); // Use tempFilePath for express-fileupload
            professional.profileImage = uploadResult.secure_url; // Store the Cloudinary URL
        }

        // Update consultation fee if provided
        if (consultationFee !== undefined) {
            professional.consultationFee = consultationFee;
        }

        // Update availability if provided
        if (availability) {
            professional.availability = availability;
        }

        // Save the updated professional data
        await professional.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            professional,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Error updating profile' });
    }
};

// Create or update availability
exports.createOrUpdateAvailability = async (req, res) => {
    const { userId } = req.params;
    const { availability } = req.body;

    console.log('Request Payload:', { userId, availability });

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { $set: { slots: availability.map(slot => ({ ...slot, isBooked: false })) } },
            { new: true, upsert: true }
        );

        console.log('Updated Professional:', professional);

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Availability updated successfully',
            professional
        });
    } catch (error) {
        console.log("Error updating availability", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update consultation fee
exports.createOrUpdateConsultationFee = async (req, res) => {
    const { professionalId } = req.params;
    const { consultationFee } = req.body;

    if (typeof consultationFee !== 'number' || consultationFee < 0) {
        return res.status(400).json({ error: 'Invalid consultation fee' });
    }

    console.log('Request Payload:', { professionalId, consultationFee });

    try {
        const professional = await Professional.findOneAndUpdate(
            { _id: professionalId },
            { consultationFee },
            { new: true, upsert: true }
        );

        console.log('Updated Professional:', professional);

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Consultation fee updated successfully',
            professional
        });

    } catch (error) {
        console.log("Error updating consultation fee", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update slots
exports.createOrUpdateSlots = async (req, res) => {
    const { userId } = req.params;
    const { slots } = req.body;

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { slots: slots.map(slot => ({ ...slot, isBooked: false })) },
            { new: true, upsert: true }
        );

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Slots updated successfully',
            professional
        });
    } catch (error) {
        console.log("Error updating slots", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get professionals by category
exports.getProfessionalsByCategory = async (req, res) => {
    const { category } = req.params;
    const allowedCategories = ['Kidney', 'Heart', 'Brain', 'Cancer', 'Skin', 'Bone'];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const professionals = await Professional.find({ category });
        res.status(200).json(professionals);
    } catch (error) {
        console.error('Error fetching professionals by category:', error);
        res.status(500).json({ message: 'Failed to fetch professionals' });
    }
};

// Get available slots
exports.getAvailableSlots = async (req, res) => {
    const { userId } = req.params;
    const { day } = req.query;

    try {
        const professional = await Professional.findOne({ user: userId });

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        let availableSlots = professional.slots.filter(slot => !slot.isBooked);
        if (day) {
            availableSlots = availableSlots.filter(slot => slot.day === day);
        }

        return res.status(200).json(availableSlots);
    } catch (error) {
        console.log("Error fetching available slots", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchProfessionals = async (req, res) => {
    const { query, specialty } = req.query;
    try {
        const professionals = await Professional.find({
            $and: [
                { $or: [{ firstName: new RegExp(query, 'i') }, { lastName: new RegExp(query, 'i') }] },
                specialty ? { specialty: new RegExp(specialty, 'i') } : {},
            ],
        }).populate('clinicId'); // Populate clinicId if needed
        res.status(200).json(professionals);
    } catch (error) {
        console.error('Error searching professionals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
