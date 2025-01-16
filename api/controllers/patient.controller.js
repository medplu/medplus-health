const Patient = require('../models/patient.model');

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const patient = new Patient(req.body);
        await patient.save();
        res.status(201).send(patient);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Retrieve all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).send(patients);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Retrieve a single patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Update a patient by userId
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.params.id });
        if (!patient) {
            return res.status(404).send({ error: 'Patient not found!' });
        }

        // Update only the fields provided in the request
        Object.keys(req.body).forEach(key => {
            const keys = key.split('.');
            if (keys.length > 1) {
                if (!patient[keys[0]]) patient[keys[0]] = {}; // Ensure nested object exists
                patient[keys[0]][keys[1]] = req.body[key];
            } else {
                patient[key] = req.body[key];
            }
        });

        await patient.save();
        res.status(200).send(patient);
    } catch (error) {
        res.status(400).send({ error: 'An error occurred while updating the patient.', details: error.message });
    }
};


// Delete a patient by ID
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) {
            return res.status(404).send();
        }
        res.status(200).send(patient);
    } catch (error) {
        res.status(500).send(error);
    }
};
