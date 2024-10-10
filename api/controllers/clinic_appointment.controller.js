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

const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const appointment = await ClinicAppointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: 'Appointment status updated successfully' });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({ message: 'Failed to update appointment status' });
    }
};

module.exports = {
    createAppointment,
    updateAppointmentStatus
};