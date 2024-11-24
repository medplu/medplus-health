const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller'); // Ensure this import is correct

router.post('/appointments', appointmentController.bookAppointment);

router.get('/appointments/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

router.get('/appointments/doctor/:doctorId/all', appointmentController.getAllAppointmentsByDoctor);

router.put('/appointments/confirm/:appointmentId', appointmentController.confirmAppointment);

// Define the route for fetching appointments by user ID
router.get('/appointments/user/:userId', appointmentController.getAppointmentsByUser);

module.exports = router;