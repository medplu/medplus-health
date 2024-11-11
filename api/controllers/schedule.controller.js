const moment = require('moment');
const Schedule = require('../models/schedule.model');
const Professional = require('../models/professional.model');
const Appointment = require('../models/appointment.model');

// Create or Update Schedule
exports.createOrUpdateSchedule = async (req, res) => {
    const { professionalId, availability } = req.body;

    // Validate the incoming data
    if (!professionalId || !Array.isArray(availability)) {
        return res.status(400).json({ message: 'Professional ID and availability are required.' });
    }

    try {
        // Verify professional exists
        const professional = await Professional.findById(professionalId);
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found.' });
        }

        // Map availability data to schedule slots
        const slots = availability.map(slot => {
            if (!slot.date || !slot.startTime || !slot.endTime) {
                throw new Error('Each slot must include date, startTime, and endTime.');
            }
            if (!moment(slot.date, moment.ISO_8601, true).isValid()) {
                throw new Error('Invalid date format. Must be in ISO format.');
            }
            return {
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: slot.isBooked,
                appointmentId: slot.appointmentId || null
            };
        });

        // Update or create the schedule
        const schedule = await Schedule.findOneAndUpdate(
            { doctorId: professionalId },
            { doctorId: professionalId, slots },
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
        const schedule = await Schedule.findOne({ doctorId: professionalId }).populate('slots.appointmentId');

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

        // Filter available slots and optionally filter by day
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

// Reset elapsed slots for a professional
exports.resetElapsedSlots = async (req, res) => {
    const { professionalId } = req.params;

    try {
        const schedule = await Schedule.findOne({ doctorId: professionalId });
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found.' });
        }

        const now = moment();
        schedule.slots.forEach(slot => {
            if (slot.isBooked && moment(slot.date).isBefore(now) && moment(slot.endTime, 'HH:mm A').isBefore(now)) {
                slot.isBooked = false;
                slot.appointmentId = null;
            }
        });

        await schedule.save();

        return res.status(200).json({ message: 'Elapsed slots reset successfully.', schedule });
    } catch (error) {
        console.error('Error resetting elapsed slots:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.createRecurringSlots = async (req, res) => {
  const { professionalId, slots, recurrence } = req.body;

  // Validate the incoming data
  if (!professionalId || !Array.isArray(slots) || !recurrence) {
    return res.status(400).json({ message: 'Professional ID, slots, and recurrence are required.' });
  }

  try {
    // Verify professional exists
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found.' });
    }

    // Generate recurring slots based on recurrence type
    const recurringSlots = [];
    slots.forEach(slot => {
      const baseDate = moment(slot.date, 'YYYY-MM-DD');
      for (let i = 1; i <= 10; i++) { 
        let newDate;
        if (recurrence === 'weekly') {
          newDate = baseDate.clone().add(i, 'weeks').format('YYYY-MM-DD');
        } else if (recurrence === 'monthly') {
          newDate = baseDate.clone().add(i, 'months').format('YYYY-MM-DD');
        }
        recurringSlots.push({
          date: newDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
          appointmentId: slot.appointmentId || null,
        });
      }
    });

   
    const schedule = await Schedule.findOneAndUpdate(
      { doctorId: professionalId },
      { $push: { slots: { $each: recurringSlots } } },
      { new: true, upsert: true }
    );

    return res.status(200).json({ message: 'Recurring slots created successfully.', schedule });
  } catch (error) {
    console.error('Error creating recurring slots:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
