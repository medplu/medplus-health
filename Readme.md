const express = require('express');
const multer = require('multer');
const { uploadImages } = require('../controllers/upload.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.array('files'), uploadImages);

module.exports = router;



const Image = require('../models/clinic_image.model');

const uploadImages = async (req, res) => {
  try {
    const { professionalId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageDocs = await Promise.all(files.map(async (file) => {
      const newImage = new Image({
        url: file.path,
        professionalId,
      });
      await newImage.save();
      return newImage.url;
    }));

    res.status(200).json({ urls: imageDocs });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'An error occurred while uploading images' });
  }
};

module.exports = {
  uploadImages,
};