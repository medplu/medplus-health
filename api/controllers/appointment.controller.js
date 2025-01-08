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
    const appointments = await Appointment.find({ userId }) // Fetches all appointments for the user
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
      // Validate and create appointment logic (as provided earlier)...
      
      // Retrieve or create the patient object
      let patient = await Patient.findOne({ name: patientName, userId: userId });
      if (!patient) {
        patient = new Patient({ name: patientName, userId: userId, ...patientDetails });
        await patient.save();
      }
  
      const newAppointment = new Appointment({
        doctorId,
        userId,
        patientId: patient._id,
        patientName: patientName,
        status,
        timeSlotId: insurance ? undefined : timeSlotId,
        time: insurance ? undefined : time,
        date,
      });
  
      await newAppointment.save();
  
      // Real-time notification logic
      const io = req.app.get('socketio');
  
      // Emit to the doctor
      io.to(doctorId).emit('newAppointment', {
        appointment: newAppointment,
        message: 'You have a new appointment.',
      });
  
      // Emit to the user
      io.to(userId).emit('appointmentConfirmation', {
        appointment: newAppointment,
        message: 'Your appointment request has been received.',
      });
  
      res.status(201).json({ appointment: newAppointment, patient });
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
