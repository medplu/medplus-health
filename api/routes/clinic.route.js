const express = require('express');
const router = express.Router();
const clinicsController = require('../controllers/clinic.controller');

// Route to register a new clinic
router.post('/register/:professionalId', clinicsController.registerClinic);

// Route to join a clinic
router.post('/join/:professionalId', clinicsController.joinClinic);

// Route to get all clinics
router.get('/', clinicsController.fetchClinics);

// Route to get a clinic by ID
router.get('/:id', clinicsController.fetchClinicById);

// router.get('/clinics/category/:category', clinicsController.fetchClinicsByCategory); // Removed this line

router.get('/specialties/:specialty', clinicsController.fetchClinicsBySpecialties);

module.exports = router;