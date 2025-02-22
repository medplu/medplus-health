const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const Schedule = require('../models/schedule.model');
const Client = require('../models/client.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model');
const moment = require('moment');
const { sendPushNotification } = require('../service/notificationService');

exports.getAllAppointmentsByDoctor = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = moment().startOf('day');
    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: today.toDate() } 
    }).populate('patientId').populate('userId'); // Populate patientId and userId
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
      status: { $in: ['confirmed', 'in progress', 'done'] }, // Include all relevant statuses
    }).populate('patientId').populate('userId'); // Populate patientId and userId
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
      .select('doctorId status time createdAt updatedAt') // Only include required appointment fields
      .populate({
        path: 'doctorId',
        select: 'firstName lastName professionalDetails.specialization profileImage yearsOfExperience consultationFee practiceLocation', // Specific doctor fields
      });

    if (!appointments.length) {
      return res.status(404).json({ error: 'No appointments found for this user' });
    }

    // Optionally format the response to make it cleaner
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment._id,
      doctor: {
        name: `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`,
        specialization: appointment.doctorId.professionalDetails?.specialization || 'N/A',
        experience: appointment.doctorId.yearsOfExperience || 'N/A',
        profileImage: appointment.doctorId.profileImage || '',
        location: appointment.doctorId.practiceLocation || 'N/A',
        consultationFee: appointment.doctorId.consultationFee || 0,
      },
      status: appointment.status,
      time: appointment.time,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments by user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bookAppointment = async (req, res) => {
  const { doctorId, userId, status, timeSlotId, time, date, insurance, patientDetails = {} } = req.body;
  const io = req.app.get('socketio'); // Get the socket.io instance

  console.log('Received timeSlotId:', timeSlotId); // Log the received timeSlotId

  try {
    // Retrieve user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const patientName = user.name;

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
      status: 'confirmed', // Update status to confirmed
      timeSlotId, // Always set timeSlotId from the request body
      time, // Always set time from the request body
      date, // Ensure the date is set correctly
      insurance // Include insurance in the appointment if provided
    });

    console.log('New appointment to be saved:', newAppointment); // Log the new appointment object

    await newAppointment.save();

    // Update the booked slot in the schedule
    const schedule = await Schedule.findOne({ professionalId: doctorId });
    if (schedule) {
      console.log('Schedule slots:', schedule.slots); // Log the schedule slots
      const slot = schedule.slots.find(slot => slot._id.toString() === timeSlotId.toString());
      console.log('Matching slot:', slot); // Log the matching slot
      if (slot) {
        slot.isBooked = true;
        slot.isBookable = false; // Update isBookable to false
        await schedule.save();
        console.log('Slot updated in schedule:', slot);

        // Emit the slot update to all connected clients
        io.emit('slotUpdated', {
          slotId: timeSlotId,
          isAvailable: false,
        });
      } else {
        console.error('Slot not found in schedule');
        return res.status(400).json({ error: 'Slot not found in schedule' });
      }
    } else {
      console.error('Schedule not found for doctor');
      return res.status(400).json({ error: 'Schedule not found for doctor' });
    }

    // Verify the saved appointment
    const savedAppointment = await Appointment.findById(newAppointment._id);
    console.log('Saved appointment:', savedAppointment); // Log the saved appointment

    // Send push notification to the user
    if (user.expoPushToken) {
      await sendPushNotification([user.expoPushToken], {
        body: 'Your appointment request has been received.',
        data: { appointmentId: newAppointment._id },
      });
    }

    res.status(201).json({ appointment: newAppointment, patient });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Confirm an appointment and emit real-time updates
exports.confirmAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const io = req.app.get('socketio');

  console.log('Received appointmentId:', appointmentId);

  // Validate the appointment ID
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment ID' });
  }

  try {
    // Find the appointment by ID and populate related fields
    const appointment = await Appointment.findById(appointmentId).populate('timeSlotId patientId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log('Appointment found:', appointment);

    // Check if the appointment has a valid time slot
    if (!appointment.timeSlotId) {
      console.log('Appointment timeSlotId is null or undefined'); // Log the issue
      return res.status(400).json({ error: 'Appointment does not have a valid time slot' });
    }

    console.log('Appointment timeSlotId:', appointment.timeSlotId); // Log the timeSlotId

    // Check if the appointment is already confirmed
    if (appointment.status === 'confirmed') {
      return res.status(400).json({ error: 'Appointment is already confirmed' });
    }

    // Update the appointment status to 'confirmed'
    appointment.status = 'confirmed';
    await appointment.save();

    console.log('Appointment confirmed:', appointment);

    // Update the booked slot in the schedule
    const schedule = await Schedule.findOne({ professionalId: appointment.doctorId });
    if (schedule) {
      console.log('Schedule slots:', schedule.slots); // Log the schedule slots
      const slot = schedule.slots.find(slot => slot._id.toString() === appointment.timeSlotId.toString());
      console.log('Matching slot:', slot); // Log the matching slot
      if (slot) {
        slot.isBooked = true;
        await schedule.save();
        console.log('Slot updated in schedule:', slot);
      } else {
        console.error('Slot not found in schedule');
        return res.status(400).json({ error: 'Slot not found in schedule' });
      }
    } else {
      console.error('Schedule not found for doctor');
      return res.status(400).json({ error: 'Schedule not found for doctor' });
    }

    // Emit the slot update to all connected clients
    io.emit('slotUpdated', {
      slotId: appointment.timeSlotId,
      isAvailable: false,
    });

    // Send push notification to the user
    const user = await User.findById(appointment.userId);
    if (user && user.expoPushToken) {
      try {
        await sendPushNotification([user.expoPushToken], {
          body: 'Your appointment has been confirmed.',
          data: { appointmentId: appointment._id },
        });
      } catch (notificationError) {
        console.error('Error sending push notification:', notificationError);
      }
    }

    // Respond with the updated appointment regardless of notification success
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
