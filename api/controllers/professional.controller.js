const Professional = require('../models/professional.model');

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

// Fetch a single professional by doctorId (_id)
exports.getProfessionalById = async (req, res) => {
    const { userId } = req.params;
    try {
        const professional = await Professional.findById(userId);
        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }
        res.status(200).json(professional);
    } catch (error) {
        console.log("Error fetching professional", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createOrUpdateAvailability = async (req, res) => {
    const { userId } = req.params; // Expecting userId in the request parameters
    const { availability } = req.body; // Expecting { availability: true/false }

    // Log the request payload
    console.log('Request Payload:', { userId, availability });

    try {
        // Find the professional by userId and update the availability field
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { $set: { availability: availability } }, // Explicitly use $set to update the field
            { new: true, upsert: true }  // If the professional does not exist, create a new one
        );

        // Log the result of the update operation
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

exports.createOrUpdateConsultationFee = async (req, res) => {
    const { userId } = req.params;
    const { consultationFee } = req.body;

    // Validate consultationFee
    if (typeof consultationFee !== 'number' || consultationFee < 0) {
        return res.status(400).json({ error: 'Invalid consultation fee' });
    }

    // Log the request payload
    console.log('Request Payload:', { userId, consultationFee });

    try {
        // Find the professional by userId and update the consultationFee field
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { consultationFee },
            { new: true, upsert: true }  // If the professional does not exist, create a new one
        );

        // Log the result of the update operation
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
// Update or create time slots for a professional
exports.createOrUpdateSlots = async (req, res) => {
    const { userId } = req.params; // Expecting userId in the request parameters
    const { slots } = req.body; // Expecting an array of slots

    try {
        // Find the professional by userId and update the slots field
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { slots },  // Update the slots field
            { new: true, upsert: true }  // If the professional does not exist, create a new one
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

// Controller action to fetch professionals by category
exports.getProfessionalsByCategory = async (req, res) => {
    const { category } = req.params;
  
    try {
      const professionals = await Professional.find({ category });
      res.status(200).json(professionals);
    } catch (error) {
      console.error('Error fetching professionals by category:', error);
      res.status(500).json({ message: 'Failed to fetch professionals' });
    }
  };

// Fetch available slots for a professional by userId
exports.getAvailableSlots = async (req, res) => {
    const { userId } = req.params;
    const { day } = req.query;  // Optional query param to filter slots by day (e.g., ?day=Monday)

    try {
        const professional = await Professional.findOne({ user: userId });

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        // Filter the available slots based on the day (if provided) and availability (not booked)
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
