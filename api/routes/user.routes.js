const express = require("express");
const userController = require('../controllers/user.controller'); // Correct the path to the user controller
const isAuthenticated = require("../middleware/isAuth");

const router = express.Router();

//!Register
router.post("/api/users/register", userController.register);
router.post("/api/users/login", userController.login);
router.post("/api/users/google-login", userController.googleLogin);
router.get("/api/users/profile", isAuthenticated, userController.profile);
router.post("/api/users/set-password", isAuthenticated, userController.setPassword);
router.post("/api/users/verify-email", userController.verifyEmail);
router.post("/api/users/updatePatientProfile", isAuthenticated, userController.updatePatientProfile);

module.exports = router;
