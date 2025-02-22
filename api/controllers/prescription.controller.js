const Joi = require('joi');
const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const Professional = require('../models/professional.model'); // Use Professional model instead of User model
const Appointment = require('../models/appointment.model'); // Import Appointment model
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const prescriptionSchema = Joi.object({
  patientId: Joi.string().required(),
  doctorId: Joi.string().required(),
  appointmentId: Joi.string().required(), // Added appointmentId to validation
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
    const { patientId, doctorId, appointmentId, medication } = req.body;

    // Validate the request body
    const { error } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Verify that the appointment exists and is associated with the patient
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== patientId) {
      return res.status(400).json({ message: 'Appointment does not belong to the specified patient' });
    }

    // Create a new prescription document
    const newPrescription = new Prescription({
      patientId,
      doctorId,
      appointmentId, // Include appointmentId
      medication,
    });

    // Save the prescription to the database
    const savedPrescription = await newPrescription.save();

    // Populate the patient, doctor, and appointment fields
    const populatedPrescription = await Prescription.findById(savedPrescription._id)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId'); // Populate appointmentId

    res.status(201).json({ prescription: populatedPrescription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create prescription', error });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the prescription by ID and populate the patient, doctor, and appointment fields
    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId'); // Populate appointmentId

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

    // Find all prescriptions for the patient and populate the doctor and appointment fields
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId')
      .populate('appointmentId');

    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get prescriptions', error });
  }
};

// Add a new controller function to get prescriptions by appointmentId
exports.getPrescriptionsByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find prescriptions associated with the appointmentId and populate related fields
    const prescriptions = await Prescription.find({ appointmentId })
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId');

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this appointment' });
    }

    res.status(200).json({ prescriptions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get prescriptions', error });
  }
};

exports.updatePrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { medication, appointmentId } = req.body; // Accept appointmentId if updating

    // Validate the request body
    const { error } = prescriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Optionally, verify the appointment existence
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
    }

    // Find the prescription by ID and update it
    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      { medication, appointmentId }, // Update fields
      { new: true }
    )
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId'); // Populate appointmentId

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

// Modify the getPrescriptionPDF function to ensure appointmentId matches
exports.getPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params; // Prescription ID from route parameters
    const { appointmentId } = req.query; // Get appointmentId from query

    // Find the prescription by ID and populate related fields
    const prescription = await Prescription.findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('appointmentId');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check if the appointmentId matches
    if (prescription.appointmentId.toString() !== appointmentId) {
      return res.status(400).json({ error: 'Appointment ID does not match the prescription' });
    }

    // Generate PDF
    const doc = generatePrescriptionPDF(prescription);
    let filename = `prescription_${id}.pdf`;
    // Stream the PDF back to the client
    res.setHeader('Content-disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error retrieving prescription data:', error);
    res.status(500).json({ error: error.message });
  }
};
