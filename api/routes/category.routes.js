const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Route to get all categories
router.get('/', categoryController.getCategories);

// Route to create a new category
router.post('/', categoryController.createCategory);

module.exports = router;