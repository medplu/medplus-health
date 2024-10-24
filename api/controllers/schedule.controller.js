const Schedule = require('../models/schedule.model');
const Professional = require('../models/professional.model');

// Create or update the schedule for a professional
exports.createOrUpdateSchedule = async (req, res) => {
    const { professionalId, availability, repeatPattern, repeatDuration } = req.body;

    // Validate the incoming data
    if (!professionalId || !Array.isArray(availability)) {
        return res.status(400).json({ message: 'Invalid data. Professional ID and availability are required.' });
    }

    try {
        // Find the professional by ID
        const professional = await Professional.findById(professionalId);

        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }

        // Log the availability array
        console.log('Availability:', availability);

        // Expand slots based on repeat pattern and duration
        const expandedSlots = expandSlots(availability, repeatPattern, repeatDuration);

        // Log the expanded slots
        console.log('Expanded Slots:', expandedSlots);

        // Update or create the schedule
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId: professionalId },
            { doctorId: professionalId, slots: expandedSlots.map(slot => ({ ...slot, isBooked: false })) },
            { new: true, upsert: true }
        );

        return res.status(200).json({ message: 'Schedule saved successfully.', schedule });
    } catch (error) {
        console.error('Error saving schedule:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// Helper function to expand slots based on repeat pattern and duration
const expandSlots = (availability, repeatPattern, repeatDuration) => {
    const expandedSlots = [];
    const now = new Date();

    availability.forEach(slot => {
        const slotDate = new Date(slot.date);
        const [startTime, endTime] = slot.time.split(' - ');

        for (let i = 0; i < repeatDuration; i++) {
            const newSlot = { ...slot, date: new Date(slotDate), startTime, endTime };
            expandedSlots.push(newSlot);

            // Update the slot date based on the repeat pattern
            if (repeatPattern === 'daily') {
                slotDate.setDate(slotDate.getDate() + 1);
            } else if (repeatPattern === 'weekly') {
                slotDate.setDate(slotDate.getDate() + 7);
            }
        }
    });

    return expandedSlots;
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