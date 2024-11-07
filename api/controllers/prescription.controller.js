const Joi = require('joi');
const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const Professional = require('../models/professional.model'); // Use Professional model instead of User model
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const prescriptionSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  medication: Joi.array().items(Joi.object({
    drugName: Joi.string().required(),
    strength: Joi.string().required(),
    frequency: Joi.string().required(),
    duration: Joi.string().required(),
  })).required(),
});

const generatePrescriptionPDF = (prescription) => {
  const doc = new PDFDocument();
  doc.fontSize(16).text('Prescription', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Patient Name: ${prescription.patientId?.name || 'N/A'}`);
  doc.text(`Date of Birth: ${prescription.patientId?.dob ? new Date(prescription.patientId.dob).toLocaleDateString() : 'N/A'}`);
  doc.text(`Weight: ${prescription.patientId?.weight || 'N/A'} kg`);
  doc.moveDown();
  doc.text(`Prescriber: ${prescription.doctorId?.name || 'N/A'}`);
  doc.text(`License Number: ${prescription.doctorId?.licenseNumber || 'N/A'}`);
  doc.text(`Contact Phone: ${prescription.doctorId?.contact?.phone || 'N/A'}`);
  doc.text(`Contact Address: ${prescription.doctorId?.contact?.address || 'N/A'}`);
  doc.moveDown();
  doc.text('Medications:');
  prescription.medication.forEach((med, index) => {
    doc.text(`${index + 1}. ${med.drugName} (${med.strength}) - ${med.frequency}, Duration: ${med.duration}`);
  });
  return doc;
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, medication } = req.body;

    // Validate the request body
    const { error } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Create a new prescription document
    const newPrescription = new Prescription({
      patientId,
      doctorId,
      medication,
    });

    // Save the prescription to the database
    const savedPrescription = await newPrescription.save();

    // Populate the patient and doctor fields
    const populatedPrescription = await Prescription.findById(savedPrescription._id)
      .populate('patientId')
      .populate('doctorId');

    res.status(201).json({ prescription: populatedPrescription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create prescription', error });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the prescription by ID and populate the patient and doctor fields
    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate('doctorId');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ prescription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get prescription', error });
  }
};

exports.getPrescriptionsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Find all prescriptions for the patient
    const prescriptions = await Prescription.find({ patientId }).populate('doctorId');

    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get prescriptions', error });
  }
};

exports.updatePrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { medication } = req.body;

    // Validate the request body
    const { error } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Find the prescription by ID and update it
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { medication },
      { new: true }
    ).populate('patientId').populate('doctorId');

    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ prescription: updatedPrescription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update prescription', error });
  }
};

exports.deletePrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the prescription by ID and delete it
    const deletedPrescription = await Prescription.findByIdAndDelete(id);

    if (!deletedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.status(200).json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete prescription', error });
  }
};

exports.getPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;
    let prescription = await Prescription.findById(id).populate('patientId').populate('doctorId');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Ensure patientId and doctorId are populated
    if (!prescription.patientId || !prescription.patientId.name) {
      prescription.patientId = await Patient.findById(prescription.patientId) || null;
    }
    if (!prescription.doctorId || !prescription.doctorId.name) {
      prescription.doctorId = await Professional.findById(prescription.doctorId) || null;
    }

    const pdfDoc = generatePrescriptionPDF(prescription);
    const pdfPath = path.join(__dirname, `../prescriptions/${prescription._id}.pdf`);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.end();

    res.status(200).json({ pdfUrl: `/prescriptions/${prescription._id}.pdf` });
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
