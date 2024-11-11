const Client = require('../models/client.model');
const Professional = require('../models/professional.model');
const Student = require('../models/student.model');
const User = require('../models/user.model'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); 
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

// Register a new user
exports.register = async (req, res) => {
    try {
        const {
            userType, profession, title, consultationFee = 5000, category,
            yearsOfExperience, certifications, bio, profileImage,
            emailNotifications, pushNotifications, location,
            attachedToClinic, ...userData
        } = req.body;

        // Generate a verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expirationTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes
        userData.verificationCode = verificationCode;
        userData.verificationCodeExpires = expirationTime; // Store expiration time
        userData.isVerified = false;

        // Create a new user without hashing the password here
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
            if (!profession) {
                return res.status(400).json({ error: 'Profession is required for professionals.' });
            }

            if (profession === 'doctor' && !title) { // Validate title for doctors
                return res.status(400).json({ error: 'Title is required for doctors.' });
            }

            await new Professional({
                ...userData,
                user: newUser._id,
                profession,
                title, // Include title if profession is doctor
                consultationFee,
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

// Get user profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in the token
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            gender: user.gender,
            userType: user.userType,
            profileImage: user.profileImage,
            status: user.status
        });
    } catch (error) {
        console.log("Error fetching user profile:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Change user password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in the token
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }

        // Assign the new password; hashing is handled by the model's pre-save middleware
        user.password = newPassword;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.log("Error changing password:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // Assuming user ID is stored in the token
    const { name, email, contactInfo, profileImage } = req.body;

    // Find the user to update
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.contactInfo = contactInfo || user.contactInfo;
    user.profileImage = profileImage || user.profileImage;

    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: user // Include the updated user object in the response
    });
  } catch (error) {
    console.log("Error updating user profile:", error);
    res.status(500).json({ error: 'Internal server error' });
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

        // Check if the code is correct and not expired
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (Date.now() > user.verificationCodeExpires) {
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined; // Clear the expiration time
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.log("Error verifying email", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Deactivate user account
exports.deactivateAccount = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in the token

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Deactivate the user's account
        user.status = 'deactivated';
        await user.save();

        res.status(200).json({ message: 'Account deactivated successfully' });
    } catch (error) {
        console.log("Error deactivating account:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Controller method to update profile image
exports.updateProfileImage = async (req, res) => {
  try {
    const { file } = req.files;

    if (!file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'medplus/users',
    });

    // Update the user's profile image URL in the database
    const userId = req.user._id; // Assuming the user's ID is stored in req.user (from the authenticate middleware)

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { profileImage: result.secure_url }, 
      { new: true }
    );

    return res.status(200).json({
      message: 'Profile image updated successfully',
      imageUrl: updatedUser.profileImage, // Send back the updated image URL
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Controller method to handle image upload
exports.uploadImage = async (req, res) => {
  try {
    const { file } = req.files;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'medplus/users',
    });

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.checkUserExists = async (req, res) => {
    const { email } = req.query; // Assuming you're passing email as a query parameter
    const user = await User.findOne({ email });
    if (user) {
        return res.status(200).json({ exists: true });
    }
    return res.status(404).json({ exists: false });
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

        // Initialize doctorId and professional to null
        let doctorId = null;
        let professional = null;
        
        // Check if the user is a professional and retrieve doctorId and professional object
        if (user.userType === 'professional') {
            const professionalRecord = await Professional.findOne({ user: user._id }); // Fetch the professional record
            if (professionalRecord) {
                doctorId = professionalRecord._id; // Get the doctorId from the professional model
                professional = professionalRecord; // Attach the professional object
            }
        }

        // Include userId, firstName, lastName, doctorId, professional, and profileImage in the response
        res.status(200).json({ 
            token, 
            userId: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, // Added email field
            doctorId, 
            userType: user.userType,
            professional, // Attach the professional object if userType is professional
            profileImage: user.profileImage // Include profileImage in the response
        });
    } catch (error) {
        console.log("Error logging in", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Handle Google OAuth login
exports.googleAuth = async (req, res) => {
    try {
        const { accessToken } = req.body;

        // Verify the access token with Google
        const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userInfoResponse.ok) {
            return res.status(400).json({ error: 'Invalid Google access token' });
        }

        const userInfo = await userInfoResponse.json();

        // Check if user already exists
        let user = await User.findOne({ email: userInfo.email });

        if (!user) {
            // Create a new user
            user = new User({
                firstName: userInfo.given_name,
                lastName: userInfo.family_name,
                email: userInfo.email,
                profileImage: userInfo.picture,
                isVerified: true,
                // Add any additional fields as needed
            });

            await user.save();

            // Optionally, create entries in Client, Professional, or Student based on userType
            // ...existing conditional logic...
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            token, 
            userId: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email,
            userType: user.userType,
            // Add other necessary fields
        });
    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
