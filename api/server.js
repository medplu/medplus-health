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
const ImageUpload = require('./middleware/ImageUpload');
const ClinicImage = require('./models/clinic_image.model'); // Update import
const User = require('./models/user.model'); // Add this line
const Prescription = require('./models/prescription.model'); // Add this line
const socketIo = require('socket.io');
dotenv.config();

const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
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
const storage = multer.memoryStorage();
const upload = multer({ storage });

// File upload route using multer and ImageUpload middleware
app.post('/api/upload', upload.array('files'), (req, res, next) => {
  console.log('Received file upload request');
  next();
}, ImageUpload.uploadToCloudinary, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error('No files uploaded');
    return res.status(400).send('No files uploaded.');
  }
  const urls = req.files.map(file => file.cloudStoragePublicUrl);

  try {
    const imageDoc = new ClinicImage({
      urls: urls,
      professionalId: req.body.professionalId,
      userId: req.body.userId, // Add userId to the document
    });
    await imageDoc.save();

    res.send({
      message: "Files uploaded successfully",
      urls: urls
    });
  } catch (error) {
    console.error('Error saving image URLs to the database:', error);
    res.status(500).send('Error saving image URLs to the database.');
  }
});

// New endpoint for uploading prescription images
app.post('/api/upload-prescription', upload.array('files'), (req, res, next) => {
  console.log('Received prescription upload request');
  next();
}, ImageUpload.uploadToCloudinary, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    console.error('No files uploaded');
    return res.status(400).send('No files uploaded.');
  }
  const urls = req.files.map(file => file.cloudStoragePublicUrl);

  try {
    const prescriptionDoc = new Prescription({
      urls: urls,
      userId: req.body.userId, // Add userId to the document
    });
    await prescriptionDoc.save();

    res.send({
      message: "Prescription images uploaded successfully",
      urls: urls
    });
  } catch (error) {
    console.error('Error saving prescription image URLs to the database:', error);
    res.status(500).send('Error saving prescription image URLs to the database.');
  }
});

// New route for updating user profile with image upload
app.put('/api/users/update-profile/:userId', upload.single('profileImage'), ImageUpload.uploadToCloudinary, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, email, contactInfo } = req.body;
    const profileImage = req.file ? req.file.cloudStoragePublicUrl : null;

    // Log the received data
    console.log('Received data:', { userId, name, email, contactInfo, profileImage });

    // Find the user to update
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.contactInfo = contactInfo || user.contactInfo;
    if (profileImage) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: user // Include the updated user object in the response
    });
  } catch (error) {
    console.log("Error updating user profile:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.log("Error connecting to MongoDB", error);
});

// Import routes
const userRoutes = require('./routes/user.routes'); // Ensure this path is correct
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

const searchRoutes = require('./routes/search.routes'); 
const clinicImageRoutes = require('./routes/clinicImage.routes');

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

app.use('/prescriptions', prescriptionRoutes);
app.use('/api', searchRoutes);
app.use('/api', clinicImageRoutes);

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
