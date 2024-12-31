const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/user.model"); // Correct the path to the user model
const nodemailer = require("nodemailer");
const Professional = require("../models/professional.model"); 

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'medpluscollaborate@gmail.com',
    pass: 'agdr yire cfhm ukvv'
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

const calculateProfileCompletion = (profile) => {
  const fields = ["firstName", "lastName", "dateOfBirth", "gender", "insuranceProvider"];
  const filledFields = fields.filter(field => profile[field]);
  return (filledFields.length / fields.length) * 100;
};

const userCtrl = {
  register: asyncHandler(async (req, res) => {
    let { email, password, firstName, lastName, userType } = req.body;
    console.log({ email, password, firstName, lastName, userType });

    if (typeof email === 'object' && email.email) {
      email = email.email;
      password = email.password;
      firstName = email.firstName;
      lastName = email.lastName;
      userType = email.userType;
    }

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Please all fields are required");
    }

    // Check if user already exists
    const userExits = await User.findOne({ email: String(email) });
    if (userExits) {
      throw new Error("User already exists");
    }

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = Date.now() + 15 * 60 * 1000; // Set expiration time to 15 minutes

    // Create the user
    const userCreated = await User.create({
      username: `${firstName} ${lastName}`, // Construct username
      firstName,
      lastName,
      password: hashedPassword,
      email: String(email),
      verificationCode,
      verificationCodeExpires: expirationTime,
      isVerified: false,
      userType,
    });

    // If the userType is professional, create a Professional record
    if (userType === "professional") {
      await Professional.create({
        firstName,
        lastName,
        user: userCreated._id, // Link to the user model
      });
    }

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // Send the response
    console.log("userCreated", userCreated);
    res.json({
      username: userCreated.username,
      email: userCreated.email,
      id: userCreated.id,
      firstName: userCreated.firstName,
      lastName: userCreated.lastName,
      userType: userCreated.userType,
      message: "Verification email sent",
    });
  }),

  login: asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    // Check if user email is nested in an object
    if (typeof email === 'object' && email.email) {
      email = email.email;
      password = email.password;
    }

    // Find the user in the database
    const user = await User.findOne({ email: String(email) });

    console.log("User backend:", user);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if the user registered with Google
    if (user.loginMethod === "google") {
      throw new Error("Please use Google login to access your account.");
    }

    // Validate user password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, "anyKey", { expiresIn: "30d" });

    // Exclude sensitive information (like password) before sending the user object
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Send the response
    res.json({
      message: "Login success",
      token,
      user: userWithoutPassword,
    });
  }),

  googleLogin: asyncHandler(async (req, res) => {
    const { email, firstname, lastname } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: `${firstname} ${lastname}`,
        firstName: firstname,
        lastName: lastname,
        email,
        password: "", // No password for Google login
        isVerified: true, // Set verified status to true
        loginMethod: "google", // Set login method to Google
      });
    } else {
      if (user.loginMethod !== "google") {
        throw new Error("Please use your registered login method.");
      }
      user.isVerified = true; // Ensure existing users are verified
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, "anyKey", { expiresIn: "30d" }); // Ensure token expiration is set correctly
    res.json({
      message: "Login success",
      token,
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id, // Include userId in the response
    });
  }),

  profile: asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
      res.status(400).json({ message: "User ID is missing" });
      return;
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ user: user || null });
  }),

  setPassword: asyncHandler(async (req, res) => {
    const { userId, password } = req.body;
    if (!password) {
      throw new Error("Password is required");
    }
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ message: "Password set successfully" });
  }),

  verifyEmail: asyncHandler(async (req, res) => {
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
  }),

  updatePatientProfile: asyncHandler(async (req, res) => {
    const { userId, fullName, dateOfBirth, gender, insuranceProvider, insuranceNumber, groupNumber, policyholderName, relationshipToPolicyholder, effectiveDate, expirationDate, insuranceCardImage, preferences, address, phoneNumber, emergencyContact } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Split fullName into firstName and lastName
    const [firstName, lastName] = fullName.split(" ");

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;
    user.insuranceProvider = insuranceProvider || user.insuranceProvider;
    user.insuranceNumber = insuranceNumber || user.insuranceNumber;
    user.groupNumber = groupNumber || user.groupNumber;
    user.policyholderName = policyholderName || user.policyholderName;
    user.relationshipToPolicyholder = relationshipToPolicyholder || user.relationshipToPolicyholder;
    user.effectiveDate = effectiveDate || user.effectiveDate;
    user.expirationDate = expirationDate || user.expirationDate;
    user.insuranceCardImage = insuranceCardImage || user.insuranceCardImage;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.emergencyContact = emergencyContact || user.emergencyContact;

    if (address) {
      user.address = {
        street: address.street || user.address.street,
        city: address.city || user.address.city,
        state: address.state || user.address.state,
        zipCode: address.zipCode || user.address.zipCode,
      };
    }

    if (preferences) {
      user.preferences = {
        emailNotifications: preferences.emailNotifications !== undefined ? preferences.emailNotifications : user.preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications !== undefined ? preferences.pushNotifications : user.preferences.pushNotifications,
      };
    }

    await user.save();

    const profileCompletion = calculateProfileCompletion(user);

    res.json({
      message: "Profile updated successfully",
      profileCompletion,
    });
  }),
};

module.exports = userCtrl;
