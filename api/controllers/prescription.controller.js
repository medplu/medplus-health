const Prescription = require('../models/prescription.model');
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload');

// Middleware to handle file uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, patient, medication, instructions, refills, prescriber, warnings } = req.body;
    let fileUrl = '';

    if (req.files && req.files.file) {
      const result = await cloudinary.uploader.upload(req.files.file.tempFilePath);
      fileUrl = result.secure_url;
    }

    const newPrescription = new Prescription({
      patientId,
      doctorId,
      patient,
      medication,
      instructions,
      refills,
      prescriber,
      warnings,
      fileUrl,
    });

    const savedPrescription = await newPrescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
