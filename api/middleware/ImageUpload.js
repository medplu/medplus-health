const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ImgUpload = {};

ImgUpload.uploadToCloudinary = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const uploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'medplus' }, // Optional: specify a folder in Cloudinary
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(error);
          }
          file.cloudStoragePublicUrl = result.secure_url;
          console.log('File uploaded successfully to Cloudinary:', result.secure_url);
          resolve();
        }
      );
      stream.end(file.buffer);
    });
  });

  Promise.all(uploadPromises)
    .then(() => next())
    .catch(next);
};

module.exports = ImgUpload;
