const express = require("express");
const userController = require('../controllers/user.controller'); // Correct the path to the user controller
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

//! Register
router.post("/users/register", userController.register);
router.post("/users/login", userController.login);
router.post("/users/google-login", userController.googleLogin);
router.get("/users/profile", isAuthenticated, userController.profile);
router.post("/users/set-password", isAuthenticated, userController.setPassword);
router.post("/users/verify-email", userController.verifyEmail);
router.post("/users/updatePatientProfile", isAuthenticated, userController.updatePatientProfile);

// New route to update doctor profile
router.post("/users/updateDoctorProfile", userController.updateProfile);

// New route to save Expo Push Token
router.post("/users/saveExpoPushToken", isAuthenticated, userController.saveExpoPushToken);

module.exports = router;
