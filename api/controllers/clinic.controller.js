const Clinic = require('../models/clinic.model');
const Professional = require('../models/professional.model'); 
const cloudinary = require('cloudinary').v2; // Use require for cloudinary

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};const registerClinic = async (req, res) => {
  const { userId } = req.params; // Expecting userId in the request parameters
  const { name, contactInfo, address, category } = req.body; // Include category in the request body

  try {
    let image = null;

    // Check if an image file is uploaded
    if (req.files && req.files.image) {
      console.log('Image file detected:', req.files.image); // Debugging log
      const file = req.files.image;
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'clinics', // Optionally, specify a folder in Cloudinary
      });
      image = uploadedResponse.secure_url;
      console.log('Image uploaded to Cloudinary:', image); // Debugging log
    } else {
      console.warn('No image file detected, proceeding without it.'); // Changed to warn log for clarity
    }

    // Generate a unique reference code for the clinic
    const referenceCode = generateReferenceCode();

    // Create the clinic
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image, // Can be null if no image was uploaded
      category, // Include category in the clinic creation
      referenceCode, // Store the reference code in the clinic
      professionals: [], // Start with an empty array for professionals
    });

    await clinic.save();

    // Update the professional model to associate it with the clinic
    const professional = await Professional.findOneAndUpdate(
      { user: userId }, // Find the professional with the given userId
      {
        clinic: clinic._id, // Link the clinic ID to the professional's clinic field
        attachedToClinic: true, // Set attachedToClinic to true
      },
      { new: true } // Return the updated document
    );

    if (!professional) {
      console.warn(`No professional found for userId: ${userId}`); // Debugging log if no professional is found
    }

    res.status(201).send(clinic);
  } catch (error) {
    console.error('Error creating clinic:', error); // Debugging log
    res.status(400).send(error);
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
};