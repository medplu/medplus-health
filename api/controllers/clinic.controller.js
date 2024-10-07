const Clinic = require('../models/clinic.model'); 
const Professional = require('../models/professional.model');
const cloudinary = require('cloudinary').v2; // Use require for cloudinary

const registerClinic = async (req, res) => {
  const { userId } = req.params; // Expecting userId in the request parameters
  const { name, contactInfo, address, category, doctors } = req.body; // Include category in the request body

  // Check if the doctors field is provided and is an array
  let parsedDoctors;
  try {
    parsedDoctors = JSON.parse(doctors);
    if (!Array.isArray(parsedDoctors) || parsedDoctors.length === 0) {
      return res.status(400).json({ error: 'Doctors field is required and must be a non-empty array' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Doctors field must be a valid JSON array' });
  }

  try {
    // Fetch the Professional document using the userId from the request parameters
    const professional = await Professional.findOne({ 'user': userId });
    
    // Check if the professional exists
    if (!professional) {
      return res.status(403).json({ error: 'Only professionals can register a clinic' });
    }

    let image = null;

    // Check if an image file is uploaded
    if (req.files?.image) {
      const file = req.files.image;
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'clinics', // Optionally, specify a folder in Cloudinary
      });
      image = uploadedResponse.secure_url;
    }

    // Create the clinic
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      image,
      category, // Include category in the clinic creation
      doctors: parsedDoctors, // Use parsed doctors
      professional: professional._id, // Attach the professional to the clinic
    });

    await clinic.save();
    res.status(201).send(clinic);
  } catch (error) {
    res.status(400).send(error);
  }
};

const fetchClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().populate('doctors').populate('professional');
    res.status(200).send(clinics);
  } catch (error) {
    res.status(500).send(error);
  }
};

const fetchClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('doctors').populate('professional');
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

    // Log the category to verify it's being correctly extracted
    console.log('Category:', category);

    // Ensure the category is not undefined or null
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Fetch clinics by category
    const clinics = await Clinic.find({ category: category });

    // Log the fetched clinics to verify the query result
    console.log('Fetched clinics:', clinics);

    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error fetching clinics by category:', error);
    res.status(500).send(error);
  }
};


module.exports = {
  registerClinic,
  fetchClinics,
  fetchClinicById,
  fetchClinicsByCategory 
  
  

  

};