const Client = require('../models/client.model');
const Professional = require('../models/professional.model');
const Student = require('../models/student.model');
const User = require('../models/user.model'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Helper function to send email
const sendVerificationEmail = async (email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        text: `Your verification code is: ${verificationCode}`,
    };
    
    return transporter.sendMail(mailOptions);
};

// Handle Google OAuth
exports.handleGoogleOAuth = async (req, res) => {
    try {
        const { firstName, lastName, email, profileImage } = req.body;

        let user = await User.findOne({ email }) || new User({
            firstName,
            lastName,
            email,
            password: 'oauth_password',
            gender: 'Other',
            userType: 'client',
            profileImage,
            isVerified: true,
        });

        await user.save();
        res.status(201).json({ userId: user._id, user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Register a new user

exports.register = async (req, res) => {
    try {
        const {
            userType, profession, consultationFee = 5000, category, // Set default value here
            yearsOfExperience, certifications, bio, profileImage,
            emailNotifications, pushNotifications, location,
            attachedToClinic, ...userData
        } = req.body;

        // Generate a verification code and hash the password
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        userData.verificationCode = verificationCode;
        userData.isVerified = false;
        userData.password = await bcrypt.hash(userData.password, await bcrypt.genSalt(10));

        // Create the base user
        const newUser = await new User({ ...userData, userType }).save();

        // Conditional model saving based on userType
        if (userType === 'client') {
            await new Client({
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                user: newUser._id
            }).save();
        } else if (userType === 'professional') {
            // Ensure that 'profession' is provided for professionals
            if (!profession) {
                return res.status(400).json({ error: 'Profession is required for professionals.' });
            }

            await new Professional({
                ...userData,
                user: newUser._id,
                profession,
                consultationFee, // Default of 5000 if not provided
                category,
                yearsOfExperience,
                certifications,
                bio,
                profileImage,
                location,
                attachedToClinic
            }).save();
        } else if (userType === 'student') {
            await new Student({
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                user: newUser._id
            }).save();
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        // Send verification email
        await sendVerificationEmail(newUser.email, verificationCode);
        res.status(200).json({ message: 'Signup successful! Please check your email for the verification code.' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Email already registered' });
        } else {
            console.error("Error creating user:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};


// Check if user exists
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
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            });
        }
        return res.status(200).json({ exists: false });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Verify email
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
        user.verificationCode = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.log("Error verifying email", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log("Login attempt with email:", email); // Log email attempt
      const user = await User.findOne({ email });

      if (!user) {
          console.log("User not found");
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      console.log("Retrieved user:", user); // Log the retrieved user

      if (!user.isVerified) {
          return res.status(400).json({ error: 'Email not verified' });
      }

      const match = await bcrypt.compare(password, user.password);
      console.log("Password match:", match); // Log password match result

      if (!match) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const professional = user.userType === 'professional' ? await Professional.findOne({ user: user._id }) : null;

      res.status(200).json({
          token,
          user: {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              userType: user.userType,
              profileImage: user.profileImage,
              professional,
          },
      });
  } catch (error) {
      console.log("Error logging in", error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all professionals
exports.getProfessionals = async (req, res) => {
    try {
        const professionals = await User.find({ userType: 'professional' });
        res.status(200).json(professionals);
    } catch (error) {
        console.log("Error fetching professionals", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get user profile
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

exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, profileImage, gender } = req.body;

  try {
      // Find the user by userId and update the profile fields
      const user = await User.findOneAndUpdate(
          { _id: userId }, // Query to find the user
          { $set: { firstName, lastName, profileImage, gender } },
          { new: true, runValidators: true } // Return the updated document and run validators
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
