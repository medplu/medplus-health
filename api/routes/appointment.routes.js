const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

// Route to book an appointment
router.post('/appointments', appointmentController.bookAppointment);

// Route to get all appointments for a doctor
router.get('/appointments/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

// Route to get all appointments for a doctor without filters (new route)
router.get('/appointments/doctor/:doctorId/all', appointmentController.getAllAppointmentsByDoctor);



// Route to confirm an appointment
router.put('/appointments/confirm/:appointmentId', appointmentController.confirmAppointment);

module.exports = router;