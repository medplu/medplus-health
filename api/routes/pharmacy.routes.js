const express = require('express');
const { createPharmacy } = require('../controllers/pharmacy.controller');

const router = express.Router();

// Route to create a pharmacy (only pharmacists can create pharmacies)
router.post('/api/pharmacies', createPharmacy);


//  router.get('/api/pharmacies/:id', getPharmacyById);
//  router.put('/api/pharmacies/:id', updatePharmacy);
//  router.delete('/api/pharmacies/:id', deletePharmacy);

module.exports = router;
