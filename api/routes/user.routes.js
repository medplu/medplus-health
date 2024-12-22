const express = require("express");
const userCtrl = require("../controller/user");
const isAuthenticated = require("../middlewares/isAuth");

const router = express.Router();

//!Register
router.post("/api/users/register", userCtrl.register);
router.post("/api/users/login", userCtrl.login);
router.post("/api/users/google-login", userCtrl.googleLogin);
router.get("/api/users/profile", isAuthenticated, userCtrl.profile);
router.post("/api/users/set-password", isAuthenticated, userCtrl.setPassword);
router.post("/api/users/verify-email", userCtrl.verifyEmail);
router.post("/api/users/updatePatientProfile", isAuthenticated, userCtrl.updatePatientProfile);

module.exports = router;
