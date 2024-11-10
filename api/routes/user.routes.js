const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// User routes
router.post('/register', userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);

// Add Google authentication route
router.post('/auth/google', userController.googleAuth);

// Route to check if user exists
router.get('/auth/check-user', userController.checkUserExists); 

// Route to update user profile
router.patch('/profile', userController.updateUserProfile);

// Route to change password
router.patch('/change-password', userController.changePassword);

// Route to deactivate user account
router.patch('/deactivate', userController.deactivateAccount);

// Route to update profile image
router.patch('/profile-image', upload.single('image'), userController.updateProfileImage);

// Route to upload image
router.post('/upload-image', upload.single('file'), userController.uploadImage);

module.exports = router;