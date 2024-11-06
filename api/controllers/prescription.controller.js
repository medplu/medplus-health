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
