
const ClinicImage = require('../models/clinic_image.model');

const getImagesByProfessionalId = async (req, res) => {
  try {
    const { professionalId } = req.params;
    const images = await ClinicImage.find({ professionalId });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error retrieving images by professionalId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getImagesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const images = await ClinicImage.find({ userId });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error retrieving images by userId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getImagesByProfessionalId,
  getImagesByUserId,
};