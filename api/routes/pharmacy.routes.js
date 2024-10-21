const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');

// Create a new pharmacy
router.post('/', pharmacyController.createPharmacy);

// // Get all pharmacies
// router.get('/', pharmacyController.getAllPharmacies);

// // Get a single pharmacy by ID
// router.get('/:id', pharmacyController.getPharmacyById);

// // Update a pharmacy by ID
// router.put('/:id', pharmacyController.updatePharmacy);

// Update the location of a pharmacy by ID
router.put('/:id/location', pharmacyController.updatePharmacyLocation);

// Update the inventory of a pharmacy by ID
router.put('/:id/inventory', pharmacyController.updatePharmacyInventory);

// // Delete a pharmacy by ID
// router.delete('/:id', pharmacyController.deletePharmacy);

module.exports = router;