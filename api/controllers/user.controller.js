// user.controller.js
const Client = require('../models/client.model');
const Professional = require('../models/professional.model');
const Student = require('../models/student.model');
const User = require('../models/user.model');  // Import the base User model
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');  // Import jsonwebtoken

// Create a Nodemailer transporter (ensure your env vars are set)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
exports.handleGoogleOAuth = async (req, res) => {
  try {
    const { firstName, lastName, email, profileImage } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create a new user
      user = new User({
        firstName,
        lastName,
        email,
        password: 'oauth_password', // You might want to handle this differently
        gender: 'Other', // This needs to be handled appropriately
        userType: 'client', // This needs to be handled appropriately
        profileImage,
        isVerified: true,
      });

      await user.save();
    }

    res.status(201).json({ userId: user._id, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { 
      userType, 
      profession, 
      consultationFee, 
      category, 
      yearsOfExperience, 
      certifications, 
      bio, 
      profileImage, 
      emailNotifications, 
      pushNotifications, 
      location, 
      attachedToClinic, 
      ...userData 
    } = req.body; // Destructure relevant fields from request body

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    userData.verificationCode = verificationCode;
    userData.isVerified = false;

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    // Step 1: Save the user in the base User model
    const newUser = new User({ ...userData, userType });
    await newUser.save();

    // Step 2: Based on the userType, save in the specific model (Client, Professional, or Student)
    if (userType === 'client') {
      const newClient = new Client({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        user: newUser._id,  // Associate with the base User model
      });
      await newClient.save();
    } else if (userType === 'professional') {
      const newProfessional = new Professional({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        user: newUser._id,  // Associate with the base User model
        profession, // Save the profession field (doctor, pharmacist, nurse, etc.)
        consultationFee, 
        category,
        yearsOfExperience,
        certifications,
        bio,
        profileImage,
        emailNotifications,
        pushNotifications,
        location,
        attachedToClinic: attachedToClinic || false,  // Default to false if not provided
        clinic: null  // Default to null
      });
      await newProfessional.save();
    } else if (userType === 'student') {
      const newStudent = new Student({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        user: newUser._id,  // Associate with the base User model
      });
      await newStudent.save();
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Step 3: Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: newUser.email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email", error);
        return res.status(500).json({ error: 'Error sending verification email' });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Signup successful! Please check your email for the verification code.' });
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      console.log("Error creating user", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};



exports.checkUserExists = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({
        exists: true,
        user: {
          userId: user._id,
          userType: user.userType,
          doctorId: user.doctorId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          token: user.token, // Assuming you have a token field or generate a token here
        },
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Invalid email' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined; // Remove the verification code after successful verification
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.log("Error verifying email", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Login logic
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      if (!user.isVerified) {
          return res.status(400).json({ error: 'Email not verified' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Initialize professionalObject to null
      let professionalObject = null;
      
      // Check if the user is a professional and retrieve the entire professional object
      if (user.userType === 'professional') {
          professionalObject = await Professional.findOne({ user: user._id }); // Fetch the professional record
      }

      // Include userId, firstName, lastName, and the professional object in the response
      res.status(200).json({ 
          token, 
          userId: user._id, 
          firstName: user.firstName, 
          lastName: user.lastName, 
          email: user.email, 
          professional: professionalObject,  // Include the entire professional object
          userType: user.userType 
      });
  } catch (error) {
      console.log("Error logging in", error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfessionals = async (req, res) => {
    try {
        const professionals = await User.find({ userType: 'professional' });
        res.status(200).json(professionals);
    } catch (error) {
        console.log("Error fetching professionals", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user profile function
exports.getUserProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.log("Error fetching user profile", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// Update user profile function
exports.updateUserProfile = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, profileImage, gender } = req.body;

    try {
        // Find the user by userId and update the profile fields
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { firstName, lastName, profileImage, gender } },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.log("Error updating profile", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};