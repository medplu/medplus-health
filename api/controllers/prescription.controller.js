const Joi = require('joi');
const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model'); // Assuming you have a User model for doctors
const cloudinary = require('cloudinary').v2;
const fs = require('fs'); // Add missing fs module
const path = require('path');

const prescriptionSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
});

exports.createPrescription = async (req, res) => {
  console.log('Received data:', req.body); // Log the received data
  console.log('Received files:', req.files); // Log the received files

  const { error } = prescriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { patientId, doctorId } = req.body;
    let fileUrl = null;

    if (req.files && req.files.file) {
      const file = req.files.file;
      const tempFilePath = path.join(__dirname, '..', 'temp', file.name);
      await file.mv(tempFilePath);

      const uploadedResponse = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'prescriptions',
      });
      fileUrl = uploadedResponse.secure_url;

      fs.unlinkSync(tempFilePath); // Remove the temporary file
    } else {
      return res.status(400).json({ error: 'File is required' });
    }

    const patient = await Patient.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor not found' });
    }

    const newPrescription = new Prescription({
      patientId,
      doctorId,
      fileUrl,
    });

    const savedPrescription = await newPrescription.save();

    res.status(201).json({ prescription: savedPrescription });
  } catch (error) {
    console.error('Error creating prescription:', error); // Add logging for debugging
    res.status(500).json({ error: error.message });
  }
};
