const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

// Create a new patient
router.post('/patients', patientController.createPatient);

// Retrieve all patients
router.get('/patients', patientController.getAllPatients);

// Retrieve a single patient by ID
router.get('/patients/:id', patientController.getPatientById);

// Update a patient by ID
router.put('/patients/:id', patientController.updatePatient);

// Delete a patient by ID
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;
