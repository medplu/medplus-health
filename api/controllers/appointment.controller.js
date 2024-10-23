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
  const { doctorId, userId, patientName, patientEmail, gender, isNew, date, time, medicalRecords } = req.body;

  try {
    if (!doctorId || !userId || !patientName || !patientEmail || !gender || isNew === undefined || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the slot is already booked
    const schedule = await Schedule.findOne({ doctorId, 'slots.date': date, 'slots.time': time });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const slot = schedule.slots.find(slot => slot.date.toISOString().split('T')[0] === date && slot.time === time);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Mark the slot as booked
    slot.isBooked = true;
    await schedule.save();

    // Check if the client already exists
    let client = await Client.findOne({ email: patientEmail });
    if (!client) {
      // Create a new client if not exists
      client = new Client({
        firstName: patientName.split(' ')[0],
        lastName: patientName.split(' ').slice(1).join(' '),
        email: patientEmail,
        gender,
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
      patientEmail,
      gender,
      isNew,
      date,
      time,
      status: 'pending',
      medicalRecords: medicalRecords || []
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