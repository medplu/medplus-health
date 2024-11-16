const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const File = require('../models/file.model');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Google Cloud Storage
const gc = new Storage({
  keyFilename: './config/medplus-supat-firebase-adminsdk-1zv3d-7b3b3b7b7c.json', 
  projectId: 'medplus-supat-af28f',
});
const bucket = gc.bucket('medplus_supat');

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, mimetype, buffer } = req.file;

    // Upload the file to Google Cloud Storage and get the URL
    const fileUrl = await uploadToCloudStorage(buffer, originalname);

    // Save file metadata to the database
    const file = new File({
      name: originalname,
      url: fileUrl,
      mimeType: mimetype,
    });
    await file.save();

    res.status(200).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

async function uploadToCloudStorage(buffer, filename) {
  const blob = bucket.file(filename);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: 'auto',
  });

  return new Promise((resolve, reject) => {
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    })
    .on('error', (err) => {
      reject(err);
    })
    .end(buffer);
  });
}

module.exports = router;