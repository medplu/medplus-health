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

// Function to handle OAuth sign-in and map data
async function handleGoogleOAuth(userData) {
  const { email, given_name, family_name, picture } = userData;

  try {
      // Check if a user with the given email already exists
      let user = await User.findOne({ email });

      if (!user) {
          // If the user doesn't exist, create a new one
          user = new User({
              firstName: given_name || 'Unknown', // Use provided name or a default
              lastName: family_name || 'Unknown',
              email,
              password: await bcrypt.hash('oauth_generated_password', 10), // Generate a placeholder password
              gender: 'Other', // You can set a default or prompt user for this later
              userType: 'client', // Default or adjust based on your app logic
              profileImage: picture || '', // Store the profile picture URL
              isVerified: true, // Google users are typically verified
          });

          await user.save();
      }

      return user; // Return the user object (either found or newly created)
  } catch (error) {
      console.error('Error handling Google OAuth:', error);
      throw new Error('Failed to handle Google OAuth');
  }
}

exports.register = async (req, res) => {
    try {
      const { userType, category, ...userData } = req.body;  // Destructure userType and category from request body
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
          category, // Save the category field
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
// Email verification logic
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

        // Initialize doctorId to null
        let doctorId = null;
        
        // Check if the user is a professional and retrieve doctorId
        if (user.userType === 'professional') {
            const professional = await Professional.findOne({ user: user._id }); // Fetch the professional record
            if (professional) {
                doctorId = professional._id; // Get the doctorId from the professional model
            }
        }

        // Include userId, firstName, lastName, and doctorId in the response
          res.status(200).json({ 
            token, 
            userId: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, // Added email field
            doctorId, 
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