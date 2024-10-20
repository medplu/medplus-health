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
    status: 'confirmed',
      date: { $gte: today.toDate() } // Filter for dates that are today or in the future
    });
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { doctorId, userId, patientName } = req.body;
  let { date, time } = req.body;

  try {
    console.log('Incoming request data:', { doctorId, userId, patientName, date, time });

    if (!doctorId || !userId || !patientName) {
      console.error('Missing required fields:', { doctorId, userId, patientName });
      return res.status(400).json({ error: 'Missing required fields' });
    }

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
      status: 'pending'
    });

    console.log('New appointment data:', newAppointment);

    await newAppointment.save();

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
  console.log('Received appointmentId:', appointmentId); // Log the appointmentId

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};