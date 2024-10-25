const express = require('express');
const router = express.Router();
const clinicsController = require('../controllers/clinic.controller');

// Route to register a new clinic
router.post('/register/:userId', clinicsController.registerClinic);

// Route to get all clinics
router.get('/', clinicsController.fetchClinics);

// Route to get a clinic by ID
router.get('/:id', clinicsController.fetchClinicById);

router.get('/clinics/category/:category', clinicsController.fetchClinicsByCategory);

router.post('/join/:userId', clinicsController.joinClinic); // Add this line

module.exports = router;