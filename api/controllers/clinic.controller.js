const Clinic = require('../models/clinic.model');
const Professional = require('../models/professional.model'); 
const cloudinary = require('cloudinary').v2; // Use require for cloudinary
// const multer = require('multer'); // Remove multer import

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Specify your upload directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage: storage }); // Initialize multer

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const registerClinic = async (req, res) => { // Change from array to async function
  const { professionalId } = req.params; // Change from userId to professionalId
  const { name, contactInfo, address, category, image } = req.body; // Include image in the request body

  try {
    // Since image is already a URL, no need to upload to Cloudinary here
    // You can validate the URL if necessary

    // Generate a unique reference code for the clinic
    const referenceCode = generateReferenceCode();

    // Create the clinic
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image: image || null, // Can be null if no image was uploaded
      category, // Include category in the clinic creation
      referenceCode, // Store the reference code in the clinic
      professionals: [], // Start with an empty array for professionals
    });

    await clinic.save();

    // Update the professional model to associate it with the clinic
    const professional = await Professional.findByIdAndUpdate(
      professionalId, // Use professionalId to find the professional
      {
        clinic: clinic._id, // Link the clinic ID to the professional's clinic field
        attachedToClinic: true, // Set attachedToClinic to true
      },
      { new: true } // Return the updated document
    );

    if (!professional) {
      console.warn(`No professional found for professionalId: ${professionalId}`); // Debugging log if no professional is found
    }

    res.status(201).send(clinic);
  } catch (error) {
    console.error('Error creating clinic:', error); // Debugging log
    res.status(400).send(error);
  }
};

// Remove the array and multer middleware from registerClinic
// const registerClinic = [
//   upload.single('image'), // Remove multer middleware
//   async (req, res) => { /* ... */ }
// ];

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

const fetchClinicsByCategory = async (req, res) => {
  try {
    const category = req.query.category; // Use query parameter

    // Ensure the category is not undefined or null
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Fetch clinics by category
    const clinics = await Clinic.find({ category: category }).populate('professionals');

    res.status(200).json(clinics);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  registerClinic,
  fetchClinics,
  fetchClinicById,
  fetchClinicsByCategory,
  joinClinic, // Add joinClinic to the exported module
};