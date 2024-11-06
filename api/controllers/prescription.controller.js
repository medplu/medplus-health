const Joi = require('joi');
const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const User = require('../models/user.model'); // Assuming you have a User model for doctors
const cloudinary = require('cloudinary').v2;
const PDFDocument = require('pdfkit');
const fs = require('fs'); // Add missing fs module
const path = require('path');

const prescriptionSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  medication: Joi.array().items(Joi.object({
    drugName: Joi.string().required(),
    strength: Joi.string().required(),
    dosageForm: Joi.string().required(),
    quantity: Joi.number().required(),
  })).required(),
  instructions: Joi.object({
    dosageAmount: Joi.string().required(),
    route: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
    additionalInstructions: Joi.string().optional(),
  }).required(),
  refills: Joi.number().default(0),
  warnings: Joi.string().optional(),
});

const generatePrescriptionPDF = (prescription) => {
  const doc = new PDFDocument();
  doc.fontSize(12).text(`Prescription for ${prescription.patient.name}`, { align: 'center' });
  doc.text(`Date Issued: ${prescription.dateIssued}`, { align: 'center' });
  doc.text(`Doctor: ${prescription.prescriber.name}`, { align: 'center' });
  doc.text(`Medication: ${prescription.medication.map(med => `${med.drugName} (${med.strength})`).join(', ')}`, { align: 'center' });
  doc.text(`Instructions: ${prescription.instructions.dosageAmount} ${prescription.instructions.route} ${prescription.instructions.frequency} ${prescription.instructions.duration}`, { align: 'center' });
  doc.text(`Refills: ${prescription.refills}`, { align: 'center' });
  doc.text(`Warnings: ${prescription.warnings}`, { align: 'center' });
  return doc;
};

exports.createPrescription = async (req, res) => {
  const { error } = prescriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { patientId, doctorId, medication, instructions, refills, warnings } = req.body;
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
    }

    const patient = await Patient.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor not found' });
    }

    const newPrescription = new Prescription({
      patient: patientId,
      prescriber: doctorId,
      medication,
      instructions,
      refills,
      warnings,
      fileUrl,
    });

    const savedPrescription = await newPrescription.save();

    const pdfDoc = generatePrescriptionPDF(savedPrescription);
    const pdfPath = `./prescriptions/${savedPrescription._id}.pdf`;
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.end();

    res.status(201).json({ prescription: savedPrescription, pdfUrl: pdfPath });
  } catch (error) {
    console.error('Error creating prescription:', error); // Add logging for debugging
    res.status(500).json({ error: error.message });
  }
};
