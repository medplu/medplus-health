const express = require('express');
const { createPrescription } = require('../controllers/prescription.controller');
const fileUpload = require('express-fileupload');

const router = express.Router();

router.use(fileUpload());

router.post('/prescriptions', createPrescription);

module.exports = router;
