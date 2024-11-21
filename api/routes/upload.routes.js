
const express = require('express');
const multer = require('multer');
const { uploadImages } = require('../controllers/upload.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.array('files'), uploadImages);

module.exports = router;