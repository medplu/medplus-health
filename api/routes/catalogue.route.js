const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogue.controller');

// Route to add a new item to the catalogue
router.post('/catalogue/add', catalogueController.addItem);

// Route to update an item in the catalogue
router.put('/catalogue/update', catalogueController.updateItem);

// Route to delete an item from the catalogue
router.delete('/catalogue/delete/:pharmacyId/:itemId', catalogueController.deleteItem);

module.exports = router;
