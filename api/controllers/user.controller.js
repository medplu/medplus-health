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

// Register a new user
exports.register = async (req, res) => {
    try {
        const {
            userType, profession, consultationFee = 5000, category,
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

            await new Professional({
                ...userData,
                user: newUser._id,
                profession,
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

        // Include userId, firstName, lastName, doctorId, and professional in the response
        res.status(200).json({ 
            token, 
            userId: user._id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, // Added email field
            doctorId, 
            userType: user.userType,
            professional // Attach the professional object if userType is professional
        });
    } catch (error) {
        console.log("Error logging in", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Google Sign-In
exports.googleSignIn = async (req, res) => {
    try {
        const { firstName, lastName, email, profileImage } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if it doesn't exist
            user = new User({
                firstName,
                lastName,
                email,
                isVerified: true, // Automatically verify Google users
            });
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Ensure the redirect URI matches the frontend configuration
        // This might involve setting the correct callback URL in the OAuth flow
        // For example, when exchanging tokens or redirecting after authentication

        // Send response with user details and token
        res.status(200).json({
            token,
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        });
    } catch (error) {
        console.error("Error during Google sign-in", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
