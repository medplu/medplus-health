const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// User routes
router.post('/register', userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);
router.get('/users/professionals', userController.getProfessionals);

// Route to get user profile by userId
router.get('/users/:userId', userController.getUserProfile);

// Route to update user profile
router.put('/users/update-profile/:userId', userController.updateUserProfile);

// Route to check if user exists
router.get('/users/exists', userController.checkUserExists); // New route for checking if user exists

// Route for Google OAuth sign-in
router.post('/auth/google', userController.handleGoogleOAuth); // Route for Google OAuth

module.exports = router;