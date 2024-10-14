const Appointment = require('../models/appointment.model');
const moment = require('moment');

// Fetch all appointments for a doctor
exports.getAllAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await Appointment.find({ doctorId });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch upcoming appointments for a doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = moment().startOf('day'); // Get today's date at the start of the day
    const appointments = await Appointment.find({
      doctorId,
      status: 'booked',
      date: { $gte: today.toDate() } // Filter for dates that are today or in the future
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const moment = require('moment');
const Appointment = require('../models/appointment.model'); // Adjust the path as necessary

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { doctorId, userId, patientName } = req.body;
  let { date, time } = req.body;

  try {
    // Log incoming request data
    console.log('Incoming request data:', { doctorId, userId, patientName, date, time });

    // If date or time is not provided, use the current date and time
    if (!date) {
      date = moment().format('YYYY-MM-DD');
    }
    if (!time) {
      time = moment().format('HH:mm');
    }

    const newAppointment = new Appointment({
      doctorId,
      userId,
      patientName,
      date,
      time,
      status: 'pending' // Set initial status to 'pending'
    });

    await newAppointment.save();

    // Emit event to notify clients of new appointment
    const io = req.app.get("socketio");
    io.emit("newAppointment", newAppointment);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Confirm an appointment
exports.confirmAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Update the status to 'confirmed'
    appointment.status = 'confirmed';
    await appointment.save();

    res.status(200).json({ message: 'Appointment confirmed successfully', appointment });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};