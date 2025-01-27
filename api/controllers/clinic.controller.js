const Clinic = require('../models/clinic.model');

// Create a new clinic
const createClinic = async (req, res) => {
  try {
    const clinic = new Clinic(req.body);
    await clinic.save();
    res.status(201).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get clinic by user ID
const getClinicByUserId = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ userId: req.params.userId }).populate('insuranceProviders');
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    res.status(200).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update clinic information
const updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findOneAndUpdate({ userId: req.params.userId }, req.body, { new: true });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }
    res.status(200).json(clinic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createClinic,
  getClinicByUserId,
  updateClinic,
};
