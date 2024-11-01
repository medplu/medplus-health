const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// Existing routes...
router.get('/doctor/:doctorId', appointmentController.getAllAppointmentsByDoctor);
router.get('/doctor/upcoming/:doctorId', appointmentController.getAppointmentsByDoctor);
router.get('/user/:userId', appointmentController.getAppointmentsByUser);
router.post('/', appointmentController.bookAppointment);

// Add confirm appointment route
router.patch('/confirm/:appointmentId', appointmentController.confirmAppointment);

module.exports = router;
