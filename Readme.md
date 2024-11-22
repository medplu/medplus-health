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

const uploadImagesToBackend = async (assets) => {
    const formData = new FormData();
    formData.append('professionalId', professionalId);
  
    for (const asset of assets) {
      let imageUri = asset.uri;
  
      // If the image URI is base64, convert it to a file
      if (imageUri.startsWith('data:image')) {
        const base64Data = imageUri.split(',')[1];
        const path = `${FileSystem.cacheDirectory}myImage-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(path, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        imageUri = path;
      }
  
      // Append file to FormData
      const image = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `myImage-${Date.now()}.jpg`,
      };
      formData.append('files', image);
    }
  
    // Make the request
    try {
      const response = await fetch('https://medplus-health.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };
