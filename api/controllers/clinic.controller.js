const Clinic = require('../models/clinic.model');
const cloudinary = require('cloudinary').v2; // Use require for cloudinary

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const registerClinic = async (req, res) => {
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
      console.error('No image file detected in the request'); // Debugging log
    }

    // Generate a unique reference code for the clinic
    const referenceCode = generateReferenceCode();

    // Create the clinic
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image,
      category, // Include category in the clinic creation
      referenceCode, // Store the reference code in the clinic
      professionals: [], // Start with an empty array for professionals
    });

    await clinic.save();

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