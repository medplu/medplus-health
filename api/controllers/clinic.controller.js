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
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).send({ message: 'Professional not found' });
    }

    const referenceCode = generateReferenceCode();

    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image: image || null,
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
      certificateUrl,
    });

    await clinic.save();

    professional.clinic = clinic._id;
    professional.attachedToClinic = true;
    await professional.save();

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
  const { professionalId } = req.params;
  const { referenceCode } = req.body;

  try {
    const clinic = await Clinic.findOne({ referenceCode });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found with the provided reference code' });
    }

    const professional = await Professional.findById(professionalId);
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
  joinClinic,
  fetchClinicsBySpecialties,
};

