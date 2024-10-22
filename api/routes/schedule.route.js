const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

// Create or update the schedule for a professional
router.put('/schedule', scheduleController.createOrUpdateSchedule);

// Fetch the schedule for a professional by their ID
router.get('/schedule/:professionalId', scheduleController.getScheduleByProfessionalId);

// Fetch available slots for a professional
router.get('/schedule/available-slots/:professionalId', scheduleController.getAvailableSlots);

module.exports = router;