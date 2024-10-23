const Appointment = require('../models/appointment.model');
const Schedule = require('../models/schedule.model');
const Client = require('../models/client.model'); // Import the Client model
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
  const { doctorId, userId, patientName, status } = req.body;

  try {
    if (!doctorId || !userId || !patientName || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the client already exists
    let client = await Client.findOne({ user: userId });
    if (!client) {
      // Create a new client if not exists
      client = new Client({
        firstName: patientName.split(' ')[0],
        lastName: patientName.split(' ').slice(1).join(' '),
        user: userId,
        doctors: [doctorId]  // Add the doctorId to the doctors array
      });
    } else {
      // Add the doctorId to the doctors array if not already present
      if (!client.doctors.includes(doctorId)) {
        client.doctors.push(doctorId);
      }
    }
    await client.save();

    const newAppointment = new Appointment({
      doctorId,
      userId,
      patientName,
      status
    });

    await newAppointment.save();

    const io = req.app.get("socketio");
    io.emit("newAppointment", newAppointment);

    res.status(201).json({ appointment: newAppointment, client });
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