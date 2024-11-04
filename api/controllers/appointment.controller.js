const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const Schedule = require('../models/schedule.model');
const Client = require('../models/client.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const moment = require('moment');

// Fetch all appointments for a doctor
exports.getAllAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const appointments = await Appointment.find({ doctorId }).populate('patientId');
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
    const today = moment().startOf('day');
    const appointments = await Appointment.find({
      doctorId,
      status: 'confirmed',
      date: { $gte: today.toDate() }
    }).populate('patientId');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch appointments by user ID
exports.getAppointmentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const appointments = await Appointment.find({ userId })
      .select('doctorId userId patientName status timeSlotId time createdAt updatedAt')
      .populate('patientId')
      .populate('doctorId'); // Populate doctorId to get professional information

    if (!appointments.length) {
      return res.status(404).json({ error: 'No appointments found for this user' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Book an appointment
exports.bookAppointment = async (req, res) => {
  const { doctorId, userId, patientName, status, timeSlotId, time, patientDetails = {} } = req.body;

  try {
    if (!doctorId || !userId || !status || !timeSlotId || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findById(userId);
    const finalPatientName = patientName || `${user.firstName} ${user.lastName}`;
    const finalAge = patientDetails.age || user.age;
    const finalEmail = patientDetails.email || user.email;

    let client = await Client.findOne({ user: userId });
    if (!client) {
      client = new Client({
        firstName: finalPatientName.split(' ')[0],
        lastName: finalPatientName.split(' ').slice(1).join(' '),
        user: userId,
        doctors: [doctorId]
      });
    } else {
      if (!client.doctors.includes(doctorId)) {
        client.doctors.push(doctorId);
      }
    }
    await client.save();

    let patient = await Patient.findOne({ userId });
    if (!patient) {
      patient = new Patient({
        name: finalPatientName,
        age: finalAge,
        phone: patientDetails.phone,
        email: finalEmail,
        medicalHistory: [], // Initialize medicalHistory to an empty array
        userId: userId
      });
      await patient.save();
    }

    const schedule = await Schedule.findOne({ 'slots._id': timeSlotId, doctorId });
    if (!schedule) {
      return res.status(404).json({ error: 'Time slot not found for this doctor' });
    }

    const slot = schedule.slots.id(timeSlotId);
    if (slot.isBooked) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    const newAppointment = new Appointment({
      doctorId,
      userId,
      patientId: patient._id,
      patientName: finalPatientName,
      status,
      timeSlotId,
      time,
    });

    await newAppointment.save();

    await Schedule.updateOne(
      { 'slots._id': timeSlotId, doctorId },
      { $set: { 'slots.$.isBooked': true } }
    );

    const io = req.app.get("socketio");
    io.emit("newAppointment", {
      appointment: newAppointment,
      userId: userId,
      doctorId: doctorId
    });

    res.status(201).json({ appointment: newAppointment, client, patient });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Confirm an appointment
exports.confirmAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  console.log('Received appointmentId:', appointmentId);

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId).populate('timeSlotId patientId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log('Appointment found:', appointment);

    appointment.status = 'confirmed';
    await appointment.save();

    console.log('Appointment confirmed:', appointment);

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};