const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const paymentRoutes = require('./routes/payment.route'); // Renamed for clarity
const subaccountRoutes = require('./routes/subaccount.routes'); // Import subaccount routes
const { Server } = require("socket.io");
const fileUpload = require("express-fileupload");
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Set up socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
}));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected");
}).catch((error) => {
    console.log("Error connecting to MongoDB", error);
});

// Import the user routes
const userRoutes = require('./routes/user.routes');

// Import the professional routes
const professionalRoutes = require('./routes/professional.routes');

// Import the appointment routes
const appointmentRoutes = require('./routes/appointment.routes');

// Import the clinic routes
const clinicRoutes = require('./routes/clinic.route');

// Import the category routes
const categoryRoutes = require('./routes/category.routes');

// Import the clinic appointment routes
const clinicAppointmentRoutes = require('./routes/clinic_appointment.routes');

// Import the pharmacy routes
const pharmacyRoutes = require('./routes/pharmacy.routes'); // Import the new pharmacy routes

// Import the schedule routes
const scheduleRoutes = require('./routes/schedule.route'); // Import the schedule routes

// Import the patient routes
const patientRoutes = require('./routes/patient.routes');

// Import the catalogue routes
const catalogueRoutes = require('./routes/catalogue.route'); // Import the catalogue routes

// Import the prescription routes
const prescriptionRoutes = require('./routes/prescription.routes'); // Import the prescription routes

// Use the user routes
app.use('/api', userRoutes);

// Use the professional routes
app.use('/api', professionalRoutes);

// Use the category routes
app.use('/api/categories', categoryRoutes);

// Use the payment routes
app.use('/api/payment', paymentRoutes); // Corrected route path

// Use the subaccount routes
app.use('/api', subaccountRoutes); // Added subaccount routes

// Use the appointment routes
app.use('/api', appointmentRoutes);

// Use the clinic routes
app.use('/api/clinics', clinicRoutes);

// Use the clinic appointment routes
app.use('/api/clinic', clinicAppointmentRoutes);

// Use the pharmacy routes
app.use('/api/pharmacies', pharmacyRoutes); // Added the new pharmacy routes

// Use the schedule routes
app.use('/api', scheduleRoutes); // Added the schedule routes

// Use the patient routes
app.use('/api', patientRoutes);

// Use the catalogue routes
app.use('/api', catalogueRoutes); // Use the catalogue routes

// Use the prescription routes
app.use('/api', prescriptionRoutes); // Use the prescription routes

// Import the appointments route
const appointmentsRoute = require('./routes/appointments');
app.use('/api/appointments', appointmentsRoute);


app.use('/prescriptions', prescriptionRoutes);

// Define the route to fill the template with prescription data
app.post('/api/fill-template', (req, res) => {
  const prescription = req.body.prescription;

  // Load the template file
  const templatePath = path.join(__dirname, 'templates', 'prescription-template.ejs');
  fs.readFile(templatePath, 'utf8', (err, template) => {
    if (err) {
      return res.status(500).send('Error loading template');
    }

    // Render the template with the prescription data
    const filledTemplate = ejs.render(template, { prescription });

    // Send the filled template as the response
    res.send(filledTemplate);
  });
});

// Define the route to upload images to Cloudinary
app.post('/api/upload-image', async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).send('No image file uploaded');
  }

  const imageFile = req.files.image;

  try {
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: 'profile_images', // Optional: specify a folder in Cloudinary
    });
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).send('Error uploading image');
  }
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io accessible to routes
app.set("socketio", io);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});