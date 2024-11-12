const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    userType: {
        type: String,
        enum: ['client', 'professional', 'student'],
        required: true
    },
    profileImage: {
        type: String,
        required: false // URL of the profile image
    },
    verificationCode: {
        type: String,
        required: false
    },
    verificationCodeExpiry: {
        type: Date,
        required: false // Useful if you want the code to expire after a set time
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deactivated'],
        default: 'active' // Indicates the user's account status
    },
    favoriteDoctors: [{
        type: Schema.Types.ObjectId,
        ref: 'Professional'
    }] // Updated to reference 'Professional' model instead of 'User'
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Pre-save middleware to hash password before saving to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to check if the entered password matches the stored hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
