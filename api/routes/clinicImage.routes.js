
const express = require('express');
const router = express.Router();
const clinicImageController = require('../controllers/clinicImageController');

router.get('/images/professional/:professionalId', clinicImageController.getImagesByProfessionalId);
router.get('/images/user/:userId', clinicImageController.getImagesByUserId);

module.exports = router;