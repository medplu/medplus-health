
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');

router.post('/schedule', scheduleController.addSchedule);
router.put('/schedule', scheduleController.updateSlot);
router.get('/schedule/:doctorId', scheduleController.getSchedules);

module.exports = router;
