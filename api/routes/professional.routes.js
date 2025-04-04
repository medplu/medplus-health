const express = require('express');
const router = express.Router();
const professionalController = require('../controllers/professional.controller');

// Route to fetch all professionals
router.get('/professionals', professionalController.getProfessionals);

// Route to fetch a single professional by doctorId (_id)
router.get('/professionals/:doctorId', professionalController.getProfessionalById);

// Route to update availability status by userId
router.put('/professionals/update-availability/:userId', professionalController.createOrUpdateAvailability);

// Route to update or create time slots for a professional by userId
router.put('/professionals/:userId/slots', professionalController.createOrUpdateSlots);

// Route to fetch available slots for a professional by userId
router.get('/professionals/:userId/slots', professionalController.getAvailableSlots);

// Route to update or create consultation fee for a professional by userId
router.put('/professionals/update-consultation-fee/:professionalId', professionalController.createOrUpdateConsultationFee);

// Route to fetch professionals by category
router.get('/professionals/category/:category', professionalController.getProfessionalsByCategory);

// Route to update professional profile by userId
router.put('/professionals/update-profile/:professionalId', professionalController.updateProfile);

// Route to update professional practice information
router.post('/professionals/practice', professionalController.practice);

// Add a route that passes userId in the URL
router.get('/professionals/progress/:userId', professionalController.getProfileProgress);

// Route to update profile completion status
router.post('/professionals/update-profile-completion/:userId', professionalController.updateProfileCompletionStatus);

module.exports = router;
