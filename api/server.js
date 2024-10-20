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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
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