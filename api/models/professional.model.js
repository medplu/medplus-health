const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the professional-specific schema
const professionalSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    title: {
        type: String
    },
    consultationFee: {
        type: Number,
        default: 5000
    },
    category: {
        type: String
    },
    yearsOfExperience: {
        type: Number
    },
    certifications: {
        type: String
    },
    bio: {
        type: String
    },
    profileImage: {
        type: String
    },
    location: {
        type: String
    },
    attachedToClinic: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Professional', professionalSchema);
