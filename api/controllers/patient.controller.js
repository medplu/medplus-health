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
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        'fullName', 'email', 'phone', 'dateOfBirth', 'gender', 
        'address.street', 'address.city', 'address.state', 'address.postalCode', 'address.country',
        'profilePicture', 'emergencyContact.name', 'emergencyContact.relationship', 'emergencyContact.phone',
        'medicalHistory', 'active'
    ];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const patient = await Patient.findOne({ userId: req.params.id });
        if (!patient) {
            return res.status(404).send();
        }

        updates.forEach(update => {
            const keys = update.split('.');
            if (keys.length > 1) {
                patient[keys[0]][keys[1]] = req.body[update];
            } else {
                patient[update] = req.body[update];
            }
        });

        await patient.save();
        res.status(200).send(patient);
    } catch (error) {
        res.status(400).send(error);
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
