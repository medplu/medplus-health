const Clinic = require('../models/clinic.model');
const Professional = require('../models/professional.model'); 
const cloudinary = require('cloudinary').v2; // Use require for cloudinary
const ClinicImage = require('../models/clinic_image.model');

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const registerClinic = async (req, res) => {
  const { professionalId } = req.params;
  const {
    name,
    contactInfo,
    address,
    images, // Expect images as an array
    insuranceCompanies,
    specialties,
    education,
    experiences,
    languages,
    assistantName,
    assistantPhone,
    bio,
    certificateUrl
  } = req.body;

  try {
    // Find the professional by ID
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).send({ message: 'Professional not found' });
    }

    // Generate a unique reference code for the clinic
    const referenceCode = generateReferenceCode();

    // Create a new clinic instance with the provided data
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      images: Array.isArray(images) ? images : [], // Ensure images is an array
      referenceCode,
      professionals: [],
      insuranceCompanies,
      specialties,
      education,
      experiences,
      languages,
      assistantName,
      assistantPhone,
      bio,
      certificateUrl
    });

    // Save the clinic
    await clinic.save();

    // Associate the professional with the new clinic
    professional.clinicId = clinic._id; // Set clinicId here
    professional.attachedToClinic = true;
    await professional.save();

    // Add the professional's ID to the clinic's professionals list
    clinic.professionals.push(professional._id);
    await clinic.save();

    // Respond with the newly created clinic
    res.status(201).send(clinic);
  } catch (error) {
    console.error('Error creating clinic or updating professional:', error);
    res.status(500).send({ message: 'Error creating clinic', error });
  }
};

const fetchClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().populate({
      path: 'professionals',
      populate: [
        { path: 'user' },
        { path: 'clinic_images' } // Populate clinic images for each professional
      ]
    });
    res.status(200).send(clinics);
  } catch (error) {
    res.status(500).send(error);
  }
};

const joinClinic = async (req, res) => {
  const { professionalId } = req.params;
  const { referenceCode } = req.body;

  try {
    const clinic = await Clinic.findOne({ referenceCode });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found with the provided reference code' });
    }

    const professional = await Professional.findById(professionalId).populate('user');
    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    if (professional.attachedToClinic) {
      return res.status(400).json({ error: 'You are already attached to a clinic' });
    }

    clinic.professionals.push(professional._id);
    await clinic.save();

    await Professional.findByIdAndUpdate(
      professionalId,
      {
        clinic: clinic._id,
        attachedToClinic: true,
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
    const clinic = await Clinic.findById(req.params.id).populate({
      path: 'professionals',
      populate: [
        { path: 'user' },
        { path: 'clinic_images' } // Populate clinic images for each professional
      ]
    });
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
    const clinics = await Clinic.find({ specialties: specialty }).populate({
      path: 'professionals',
      populate: { path: 'user' }
    });
    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error fetching clinics by specialties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchClinics = async (req, res) => {
  const { query, specialty, filter } = req.query;
  try {
    const clinics = await Clinic.find({
      $and: [
        { name: new RegExp(query, 'i') },
        specialty ? { specialties: specialty } : {},
        filter ? { specialties: new RegExp(filter, 'i') } : {},
      ],
    });
    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error searching clinics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerClinic,
  fetchClinics,
  fetchClinicById,
  joinClinic,
  fetchClinicsBySpecialties,
  searchClinics,
};

