const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// User routes
router.post('/register', userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);

// Add Google authentication route
router.post('/auth/google', userController.googleAuth);

// Route to check if user exists
router.get('/auth/check-user', userController.checkUserExists); 


// Route to update user profile
router.patch('/profile', authenticate, userController.updateUserProfile);

// Route to change password
router.patch('/change-password', authenticate, userController.changePassword);

// Route to deactivate user account
router.patch('/deactivate', authenticate, userController.deactivateAccount);

// Route to update profile image
router.patch('/profile-image', authenticate, userController.updateProfileImage);


module.exports = router;