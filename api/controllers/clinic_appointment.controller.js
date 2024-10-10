const ClinicAppointment = require('../models/clinic_appointment.model');

const createAppointment = async (req, res) => {
    try {
        const { userId, clinicId, date, time, notes } = req.body;

        // Create a new appointment
        const newAppointment = new ClinicAppointment({
            userId,
            clinicId,
            date,
            time,
            notes,
            status: 'pending'
        });

        // Save the appointment to the database
        const savedAppointment = await newAppointment.save();

        res.status(201).json(savedAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Failed to create appointment' });
    }
};

module.exports = {
    createAppointment
};