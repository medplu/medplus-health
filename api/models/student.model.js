const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the student-specific schema
const studentSchema = new Schema({
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
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',  // Reference to the base User model
        required: true
    },
    // Add any student-specific fields here
    university: {
        type: String,
        
    },
    degreeProgram: {
        type: String,
       
    },
    yearOfStudy: {
        type: Number,
       
    },
    // You can add more fields here as necessary
});

// Create and export the 'Student' model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
