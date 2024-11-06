const Prescription = require('../models/prescription.model');
const cloudinary = require('cloudinary').v2;

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, patient, medication, instructions, refills, prescriber, warnings } = req.body;
    let fileUrl = null;

    if (req.files && req.files.file) {
      console.log('File detected:', req.files.file); // Debugging log
      const file = req.files.file;
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'prescriptions', // Optionally, specify a folder in Cloudinary
      });
      fileUrl = uploadedResponse.secure_url;
      console.log('File uploaded to Cloudinary:', fileUrl); // Debugging log
    } else {
      console.warn('No file detected, proceeding without it.'); // Changed to warn log for clarity
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
      fileUrl, // Can be null if no file was uploaded
    });

    const savedPrescription = await newPrescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    console.error('Error creating prescription:', error); // Debugging log
    res.status(500).json({ error: error.message });
  }
};
