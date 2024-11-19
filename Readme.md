const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const pharmacyRoutes = require('./api/routes/pharmacy.routes');
const searchRoutes = require('./api/routes/search.routes'); // Import the search routes

const app = express();

// ...existing code...

// Use the pharmacy routes
app.use('/api/pharmacies', pharmacyRoutes);

// Use the search routes
app.use('/api', searchRoutes); // Added the new search routes

// ...existing code...

const PORT = process.env.PORT || 3000; // Updated port to 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});