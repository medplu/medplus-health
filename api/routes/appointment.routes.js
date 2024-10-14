const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');


router.post('/appointments', appointmentController.bookAppointment);

router.get('/appointments/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

router.get('/appointments/doctor/:doctorId/all', appointmentController.getAllAppointmentsByDoctor);

router.put('/appointments/confirm/:appointmentId', appointmentController.confirmAppointment);

module.exports = router;