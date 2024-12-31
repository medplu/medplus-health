const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: false },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpires: {
      type: Date,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginMethod: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    dateOfBirth: { type: Date },
    gender: { type: String },
    phoneNumber: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
    emergencyContact: { type: String },
    insuranceProvider: { type: String },
    insuranceNumber: { type: String },
    groupNumber: { type: String },
    policyholderName: { type: String },
    relationshipToPolicyholder: { type: String },
    effectiveDate: { type: String },
    expirationDate: { type: String },
    insuranceCardImage: { type: String, default: null },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: false },
    },
    // New userType field
    userType: {
      type: String,
      enum: ["professional", "client"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compile to form the model
module.exports = mongoose.model("User", userSchema);
