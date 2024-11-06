const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const prescriptionController = require('../controllers/prescription.controller');

router.use(fileUpload());

router.post('/prescriptions', prescriptionController.createPrescription);
router.get('/prescriptions/:id/download', (req, res) => {
  const pdfPath = `./prescriptions/${req.params.id}.pdf`;
  res.download(pdfPath);
});

// Route to generate and fetch the prescription PDF
router.get('/prescriptions/:id/pdf', prescriptionController.getPrescriptionPDF);

module.exports = router;
