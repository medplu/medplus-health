const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

dotenv.config();

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

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// File upload route using multer
app.post('/api/upload', upload.single('file'), (req, res) => { // Ensured the field name 'file' is specified
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send("File uploaded successfully");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.log("Error connecting to MongoDB", error);
});

// Import routes
const userRoutes = require('./routes/user.routes');
const professionalRoutes = require('./routes/professional.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const clinicRoutes = require('./routes/clinic.route');
const categoryRoutes = require('./routes/category.routes');
const clinicAppointmentRoutes = require('./routes/clinic_appointment.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const scheduleRoutes = require('./routes/schedule.route');
const patientRoutes = require('./routes/patient.routes');
const catalogueRoutes = require('./routes/catalogue.route');
const prescriptionRoutes = require('./routes/prescription.routes');
const paymentRoutes = require('./routes/payment.route');
const subaccountRoutes = require('./routes/subaccount.routes');
const fileRoutes = require('./routes/file.route');
const appointmentsRoute = require('./routes/appointments');
const searchRoutes = require('./routes/search.routes'); 

// Use routes
app.use('/api', userRoutes);
app.use('/api', professionalRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/clinic', clinicAppointmentRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', patientRoutes);
app.use('/api', catalogueRoutes);
app.use('/api', prescriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', subaccountRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/appointments', appointmentsRoute);
app.use('/prescriptions', prescriptionRoutes);
app.use('/api', searchRoutes);

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

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io accessible to routes
app.set("socketio", io);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});