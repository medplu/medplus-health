const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

// ...existing code...

// Middleware to handle file uploads
app.use(fileUpload());

// ...existing code...
