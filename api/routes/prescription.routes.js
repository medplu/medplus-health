const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path'); // Add this line
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');

router.use(fileUpload());

router.post('/prescriptions', prescriptionController.createPrescription);

// Route to fetch the prescription data
router.get('/prescriptions/:id', prescriptionController.getPrescriptionPDF);

module.exports = router;
