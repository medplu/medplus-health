const Image = require('../models/image.model');

exports.uploadImage = async (req, res) => {
  const { pharmacyId, imageUrl } = req.body;

  if (!pharmacyId || !imageUrl) {
    return res.status(400).json({ message: 'Pharmacy ID and Image URL are required' });
  }

  try {
    const newImage = new Image({ pharmacyId, imageUrl });
    await newImage.save();
    res.status(201).json({ message: 'Image uploaded successfully', image: newImage });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error });
  }
};
