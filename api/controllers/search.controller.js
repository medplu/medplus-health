
const Professional = require('../models/professional.model');
const Clinic = require('../models/clinic.model');

exports.search = async (req, res) => {
  const { query } = req.query;

  try {
    // Search professionals
    const professionals = await Professional.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
        // Add other fields as needed
      ],
    });

    // Search clinics
    const clinics = await Clinic.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } },
        // Add other fields as needed
      ],
    });

    res.status(200).json({ professionals, clinics });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};