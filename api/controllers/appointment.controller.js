const mongoose = require('mongoose'); // Add mongoose import
const Appointment = require('../models/appointment.model');
const Schedule = require('../models/schedule.model');
const Client = require('../models/client.model'); // Import the Client model
const Patient = require('../models/patient.model'); // Import the Patient model
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
    const today = moment().startOf('day'); // Get today's date at the start of the day
    const appointments = await Appointment.find({
      doctorId,
      status: 'confirmed',
      date: { $gte: today.toDate() } // Filter for dates that are today or in the future
    }).populate('patientId');
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch appointments by user ID
exports.getAppointmentsByUser = async (req, res) => {
  const { userId } = req.params; // Get userId from request parameters

  try {
    // Fetch appointments for the given userId and select desired fields
    const appointments = await Appointment.find({ userId })
      .select('doctorId userId patientName status timeSlotId time createdAt updatedAt')
      .populate('patientId');

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
  const { doctorId, userId, patientName, status, timeSlotId, time, patientDetails } = req.body;

  try {
      if (!doctorId || !userId || !patientName || !status || !timeSlotId || !time || !patientDetails) {
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

      // Check if the patient already exists
      let patient = await Patient.findOne({ email: patientDetails.email });
      if (!patient) {
          // Create a new patient if not exists
          patient = new Patient(patientDetails);
          await patient.save();
      }

      // Check if the time slot is already booked
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
          patientId: patient._id, // Add patientId to appointment
          patientName,
          status,
          timeSlotId, // Add timeSlotId to appointment
          time,       // Add time to appointment
      });

      await newAppointment.save();

      // Mark the slot as booked using positional operator
      await Schedule.updateOne(
        { 'slots._id': timeSlotId, doctorId },
        { $set: { 'slots.$.isBooked': true } }
      );

      const io = req.app.get("socketio");
      // Emit the appointment to both doctor and patient
      io.emit("newAppointment", {
          appointment: newAppointment,
          userId: userId, // Notify the patient
          doctorId: doctorId // Notify the doctor
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
  
  console.log('Received appointmentId:', appointmentId); // Log the appointmentId

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) { // Validate appointmentId
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId).populate('timeSlotId patientId'); // Populate timeSlotId and patientId

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log('Appointment found:', appointment); // Log appointment details

    appointment.status = 'confirmed';
    await appointment.save();

    console.log('Appointment confirmed:', appointment); // Log confirmation

    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};