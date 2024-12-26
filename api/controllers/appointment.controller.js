const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const Schedule = require('../models/schedule.model');
const Client = require('../models/client.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const moment = require('moment');

exports.getAllAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = moment().startOf('day');
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: today.toDate() } 
    }).populate('patientId');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = moment().startOf('day');
    const appointments = await Appointment.find({
      doctorId,
      status: 'confirmed',
      
    }).populate('patientId'); 
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getAppointmentsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const today = moment().startOf('day');
    const appointments = await Appointment.find({
      userId,
      status: 'confirmed',
      date: { $gte: today.toDate() }
    })
      .select('doctorId userId patientName status timeSlotId time createdAt updatedAt') // Selects specific fields
      .populate('patientId') 
      .populate('doctorId'); 

    if (!appointments.length) {
      return res.status(404).json({ error: 'No appointments found for this user' });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.bookAppointment = async (req, res) => {
  const { doctorId, userId, patientName, status, timeSlotId, time, date, insurance, patientDetails = {} } = req.body;

  try {
    if (!doctorId || !userId || !status || !date || (!insurance && (!timeSlotId || !time))) {
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

    if (!insurance) {
      const schedule = await Schedule.findOne({ 'slots._id': timeSlotId, doctorId });
      if (!schedule) {
        return res.status(404).json({ error: 'Time slot not found for this doctor' });
      }

      const slot = schedule.slots.id(timeSlotId);
      if (slot.isBooked) {
        return res.status(400).json({ error: 'Time slot is already booked' });
      }

      await Schedule.updateOne(
        { 'slots._id': timeSlotId, doctorId },
        { $set: { 'slots.$.isBooked': true } }
      );
    }

    const newAppointment = new Appointment({
      doctorId,
      userId,
      patientId: patient._id,
      patientName: finalPatientName,
      status,
      timeSlotId: insurance ? undefined : timeSlotId,
      time: insurance ? undefined : time,
      date, // Ensure date is included
    });

    await newAppointment.save();

    // Emit event for new appointment to the specific user
    const io = req.app.get("socketio");
    io.to(userId).emit("newAppointment", {
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
