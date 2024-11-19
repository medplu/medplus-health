
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/search', searchController.search);

module.exports = router;