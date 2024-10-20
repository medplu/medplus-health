// professional.controller.js

const Professional = require('../models/professional.model');
const cloudinary = require('cloudinary').v2;

// Fetch all professionals
exports.getProfessionals = async (req, res) => {
    try {
        const professionals = await Professional.find();
        res.status(200).json(professionals);
    } catch (error) {
        console.log("Error fetching professionals", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Fetch a single professional by userId (user field)
exports.getProfessionalById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Check if doctorId is a valid ObjectId
        const mongoose = require('mongoose');
        let userObjectId;

        if (mongoose.Types.ObjectId.isValid(doctorId)) {
            userObjectId = mongoose.Types.ObjectId(doctorId);
        } else {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        // Find the professional using the user field
        const professional = await Professional.findOne({ user: userObjectId });

        // If the professional is not found, return a 404 error.
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        // Return the found professional.
        res.status(200).json(professional);
    } catch (error) {
        console.error("Error fetching professional:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update professional profile
exports.updateProfessionalProfile = async (req, res) => {
    const { userId } = req.params; // The user ID to match the `user` field in the Professional document.
    const updateFields = {};

    // Define the list of fields that are allowed to be updated.
    const fields = ['firstName', 'lastName', 'category', 'yearsOfExperience', 'bio', 'availability', 'consultationFee'];

    // Iterate through the allowed fields and add them to updateFields if provided.
    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateFields[field] = req.body[field];
        }
    });

    try {
        // Handle profile image upload if provided
        if (req.files?.profileImage) {
            const file = req.files.profileImage;
            const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: 'profiles', // Optionally, specify a folder in Cloudinary for organization.
            });
            updateFields.profileImage = uploadedResponse.secure_url;
        }

        // Log the userId and updateFields for debugging
        console.log('Updating profile for userId:', userId);
        console.log('Update fields:', updateFields);

        // Ensure the userId is treated as an ObjectId if necessary
        const mongoose = require('mongoose');
        const userObjectId = mongoose.Types.ObjectId(userId);

        const professional = await Professional.findOneAndUpdate(
            { user: userObjectId }, // Use the correct field `user` to find the professional.
            { $set: updateFields },
            { new: true, upsert: false } // Ensure upsert is false to avoid creating a new document.
        );

        // If the professional is not found, return a 404 error.
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        // Return a success message with the updated professional document.
        return res.status(200).json({
            message: 'Professional profile updated successfully',
            professional,
        });
    } catch (error) {
        console.log('Error updating professional profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update consultation fee
exports.createOrUpdateConsultationFee = async (req, res) => {
    const { userId } = req.params;
    const { consultationFee } = req.body;

    if (typeof consultationFee !== 'number' || consultationFee < 0) {
        return res.status(400).json({ error: 'Invalid consultation fee' });
    }

    console.log('Request Payload:', { userId, consultationFee });

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
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
            { slots },
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

// Create or update availability
exports.createOrUpdateAvailability = async (req, res) => {
    const { userId } = req.params;
    const { availability } = req.body;

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { availability },
            { new: true, upsert: true }
        );

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