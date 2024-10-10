const express = require('express');
const router = express.Router();
const clinicAppointmentController = require('../controllers/clinic_appointment.controller');

// Route to create a new appointment
router.post('/appointments', clinicAppointmentController.createAppointment);

module.exports = router;