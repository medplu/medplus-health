const moment = require('moment'); // Import moment for date manipulation
const Schedule = require('../models/schedule.model');
const Professional = require('../models/professional.model');

exports.createOrUpdateSchedule = async (req, res) => {
    const { professionalId, availability } = req.body;

    // Validate the incoming data
    if (!professionalId || !Array.isArray(availability)) {
        return res.status(400).json({ message: 'Invalid data. Professional ID and availability are required.' });
    }

    // Validate each availability entry
    for (const slot of availability) {
        const { date, startTime, endTime, status } = slot;

        // Check for required fields
        if (!date || !startTime || !endTime || !status) {
            return res.status(400).json({ message: 'Each availability entry must have date, startTime, endTime, and status.' });
        }

        // Optional: Validate the status field (for example, must be "available" or "booked")
        const validStatuses = ['available', 'booked'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}.` });
        }
    }

    try {
        // Find the professional by ID
        const professional = await Professional.findById(professionalId);

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }

        // Log the availability array
        console.log('Availability:', availability);

        // Update or create the schedule
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId: professionalId },
            { doctorId: professionalId, slots: availability.map(slot => ({ 
                date: slot.date, 
                startTime: slot.startTime, 
                endTime: slot.endTime, 
                status: slot.status, 
                isBooked: false 
            })) },
            { new: true, upsert: true }
        );

        return res.status(200).json({ message: 'Schedule saved successfully.', schedule });
    } catch (error) {
        console.error('Error saving schedule:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


// Fetch the schedule for a professional by their ID
exports.getScheduleByProfessionalId = async (req, res) => {
    const { professionalId } = req.params;

    try {
        const schedule = await Schedule.findOne({ doctorId: professionalId });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found.' });
        }

        return res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// Fetch available slots for a professional
exports.getAvailableSlots = async (req, res) => {
    const { professionalId } = req.params;
    const { day } = req.query;

    try {
        const schedule = await Schedule.findOne({ doctorId: professionalId });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found.' });
        }

        let availableSlots = schedule.slots.filter(slot => !slot.isBooked);
        if (day) {
            availableSlots = availableSlots.filter(slot => moment(slot.date).format('dddd') === day);
        }

        return res.status(200).json(availableSlots);
    } catch (error) {
        console.error('Error fetching available slots:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// Reset slots that have elapsed
exports.resetElapsedSlots = async (req, res) => {
    const { professionalId } = req.params;

    try {
        const schedule = await Schedule.findOne({ doctorId: professionalId });

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found.' });
        }

        const now = moment();
        schedule.slots.forEach(slot => {
            if (slot.isBooked && moment(slot.endTime).isBefore(now)) {
                slot.isBooked = false;
            }
        });

        await schedule.save();

        return res.status(200).json({ message: 'Elapsed slots reset successfully.', schedule });
    } catch (error) {
        console.error('Error resetting elapsed slots:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};
