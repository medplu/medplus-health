const Joi = require('joi');
const Prescription = require('../models/prescription.model');
const Patient = require('../models/patient.model');
const Professional = require('../models/professional.model'); // Import the Professional model
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
  doc.fontSize(16).text('Prescription', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Patient Name: ${prescription.patient.name || 'N/A'}`);
  doc.text(`Date of Birth: ${prescription.patient.dob ? new Date(prescription.patient.dob).toLocaleDateString() : 'N/A'}`);
  doc.text(`Weight: ${prescription.patient.weight || 'N/A'} kg`);
  doc.moveDown();
  doc.text(`Prescriber: ${prescription.prescriber.name || 'N/A'}`);
  doc.text(`License Number: ${prescription.prescriber.licenseNumber || 'N/A'}`);
  doc.text(`Contact Phone: ${prescription.prescriber.contact.phone || 'N/A'}`);
  doc.text(`Contact Address: ${prescription.prescriber.contact.address || 'N/A'}`);
  doc.moveDown();
  doc.text('Medications:');
  prescription.medication.forEach((med, index) => {
    doc.text(`${index + 1}. ${med.drugName} (${med.strength}) - ${med.dosageForm}, Quantity: ${med.quantity}`);
  });
  doc.moveDown();
  doc.text('Instructions:');
  doc.text(`Dosage Amount: ${prescription.instructions.dosageAmount}`);
  doc.text(`Route: ${prescription.instructions.route}`);
  doc.text(`Frequency: ${prescription.instructions.frequency}`);
  doc.text(`Duration: ${prescription.instructions.duration}`);
  if (prescription.instructions.additionalInstructions) {
    doc.text(`Additional Instructions: ${prescription.instructions.additionalInstructions}`);
  }
  doc.moveDown();
  doc.text(`Refills: ${prescription.refills}`);
  if (prescription.warnings) {
    doc.text(`Warnings: ${prescription.warnings}`);
  }
  return doc;
};

exports.createPrescription = async (req, res) => {
  console.log('Received data:', req.body); // Log the received data

  const { error } = prescriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { patientId, doctorId, medication, instructions, refills, warnings } = req.body;

    console.log('Checking patient ID:', patientId);
    const patient = await Patient.findById(patientId);
    console.log('Patient found:', patient);

    console.log('Checking doctor ID:', doctorId);
    const doctor = await Professional.findById(doctorId); // Query the Professional model
    console.log('Doctor found:', doctor);

    if (!patient || !doctor) {
      return res.status(404).json({ error: 'Patient or Doctor not found' });
    }

    const newPrescription = new Prescription({
      patientId,
      doctorId,
      patient: {
        name: patient?.name ?? null,
        dob: patient?.dob ?? null,
        weight: patient?.weight ?? null,
      },
      prescriber: {
        name: `${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`,
        licenseNumber: doctor?.licenseNumber ?? null,
        contact: {
          phone: doctor?.phone ?? null,
          address: doctor?.address ?? null,
        },
      },
      medication,
      instructions,
      refills,
      warnings,
    });

    const savedPrescription = await newPrescription.save();

    res.status(201).json({ prescription: savedPrescription });
  } catch (error) {
    console.error('Error creating prescription:', error); // Add logging for debugging
    res.status(500).json({ error: error.message });
  }
};

exports.getPrescriptionPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const prescription = await Prescription.findById(id).populate('patientId').populate('doctorId');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
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
