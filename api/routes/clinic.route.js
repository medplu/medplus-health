const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinic.controller');

// Route to create a new clinic
router.post('/', clinicController.createClinic);

// Route to get clinic information by user ID
router.get('/:userId', clinicController.getClinicByUserId);

// Route to update clinic information by user ID
router.put('/:userId', clinicController.updateClinic);

module.exports = router;
