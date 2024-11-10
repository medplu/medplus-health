const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files

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
router.patch('/profile-image', userController.updateProfileImage);

// Route to upload image
router.post('/upload-image', upload.single('file'), userController.uploadImage);

module.exports = router;