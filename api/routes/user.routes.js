const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// User routes
router.post('/register', userController.register);
router.post('/verify-email', userController.verifyEmail);
router.post('/login', userController.login);

// Route to check if user exists
router.get('/users/exists', userController.checkUserExists); // New route for checking if user exists


module.exports = router;