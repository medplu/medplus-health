const Clinic = require('../models/clinic.model');
const Professional = require('../models/professional.model'); 
const cloudinary = require('cloudinary').v2; // Use require for cloudinary

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const registerClinic = async (req, res) => {
  const { professionalId } = req.params;
  const { name, contactInfo, address, image, insuranceCompanies, specialties, education, experiences, languages, assistantName, assistantPhone, bio, certificateUrl } = req.body;

  try {
    // Validate if the professional exists before creating the clinic
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).send({ message: 'Professional not found' });
    }

    // Generate a unique reference code for the clinic
    const referenceCode = generateReferenceCode();

    // Create the clinic
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image: image || null,
      referenceCode,
      professionals: [], // Initialize with an empty array for professionals
      insuranceCompanies, // Add insurance companies to the clinic
      specialties,
      education,
      experiences, // Ensure experiences array is added to the clinic
      languages,
      assistantName,
      assistantPhone,
      bio,
      certificateUrl, // Add the certificate URL to the clinic data
    });

    await clinic.save();

    // Link the clinic to the professional and update fields directly
    professional.clinic = clinic._id;
    professional.attachedToClinic = true;
    await professional.save();

    // Add the professional to the clinic's professionals array and save clinic again
    clinic.professionals.push(professional._id);
    await clinic.save();

    res.status(201).send(clinic);
  } catch (error) {
    console.error('Error creating clinic or updating professional:', error);
    res.status(500).send({ message: 'Error creating clinic', error });
  }
};

const fetchClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().populate('professionals'); // Populate professionals
    res.status(200).send(clinics);
  } catch (error) {
    res.status(500).send(error);
  }
};

const joinClinic = async (req, res) => {
  const { professionalId } = req.params; // Change from userId to professionalId
  const { referenceCode } = req.body; // Expecting the referenceCode in the request body

  try {
    // Find the clinic with the provided reference code
    const clinic = await Clinic.findOne({ referenceCode });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found with the provided reference code' });
    }

    // Find the professional associated with the professionalId
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    // Check if the professional is already attached to the clinic
    if (professional.attachedToClinic) {
      return res.status(400).json({ error: 'You are already attached to a clinic' });
    }

    // Update the clinic to include this professional
    clinic.professionals.push(professional._id); // Add professional ID to the clinic's professionals array
    await clinic.save();

    // Update the professional document to reflect the clinic association
    await Professional.findByIdAndUpdate(
      professionalId, // Use professionalId to find the professional
      {
        clinic: clinic._id,
        attachedToClinic: true, // Set attachedToClinic to true
      },
      { new: true }
    );

    res.status(200).json({ message: 'Successfully joined the clinic', clinic });
  } catch (error) {
    console.error('Error joining clinic:', error);
    res.status(500).send(error);
  }
};

const fetchClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('professionals'); // Populate professionals
    if (!clinic) {
      return res.status(404).send();
    }
    res.status(200).send(clinic);
  } catch (error) {
    res.status(500).send(error);
  }
};

const fetchClinicsBySpecialties = async (req, res) => {
  const { specialty } = req.params;
  try {
    const clinics = await Clinic.find({ specialties: specialty }).populate('professionals');
    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error fetching clinics by specialties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerClinic,
  fetchClinics,
  fetchClinicById,
  joinClinic, // Existing exported functions
  fetchClinicsBySpecialties, // Added fetchClinicsBySpecialties
};

