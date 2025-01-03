const Professional = require('../models/professional.model');
const mongoose = require('mongoose'); // Import mongoose
const cloudinary = require('cloudinary').v2; // Make sure cloudinary is properly configured

// Fetch all professionals with only userId and clinicId populated as IDs
exports.getProfessionals = async (req, res) => {
  try {
    // Fetch professionals and populate both clinicId and user fields
    const professionals = await Professional.find()
      .populate('clinicId')    // Populate the clinicId with the full clinic document
      .populate('user');       // Populate the user field to include professional details

    console.log("Fetched professionals with details:", professionals);
    res.status(200).json(professionals);
  } catch (error) {
    console.error("Error fetching professionals:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch a single professional by doctorId (_id) with userId and clinicId as ObjectIds
exports.getProfessionalById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Fetch a single professional and return userId and clinicId as ObjectIds
    const professional = await Professional.findById(doctorId)
      .populate('user')   // Populate user field with full user details
      .populate('clinicId'); // Populate clinicId field with full clinic details

    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    res.status(200).json(professional);
  } catch (error) {
    console.error("Error fetching professional:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch a professional by userId, with userId and clinicId as ObjectIds
exports.getProfessionalByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching professional with userId: ${userId}`);

    // Fetch professional by userId and return userId and clinicId as ObjectIds
    const professional = await Professional.findOne({ user: userId })
      .populate('user')   // Populate user field with full user details
      .populate('clinicId'); // Populate clinicId field with full clinic details

    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    res.status(200).json(professional);
  } catch (error) {
    console.error("Error fetching professional:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.updateProfile = async (req, res) => {
    const { professionalId } = req.params; // This is actually the user ID in the document
    const {
        consultationFee,
        medicalDegrees,
        specialization,
        certifications,
        licenseNumber,
        issuingMedicalBoard,
        yearsOfExperience,
    } = req.body; // Extract the updated details from the request body

    try {
        // Check if the professional exists by matching the user field with the provided professionalId
        const professional = await Professional.findOne({ user: professionalId });
        if (!professional) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        // Handle professional details update with safer JSON parsing
        if (medicalDegrees) {
            try {
                professional.professionalDetails.medicalDegrees = Array.isArray(medicalDegrees)
                    ? medicalDegrees
                    : JSON.parse(medicalDegrees);
            } catch (error) {
                professional.professionalDetails.medicalDegrees = [medicalDegrees]; // Assume plain string and wrap in an array
            }
        }

        if (specialization) {
            professional.professionalDetails.specialization = specialization;
        }

        if (certifications) {
            try {
                professional.professionalDetails.certifications = Array.isArray(certifications)
                    ? certifications
                    : JSON.parse(certifications);
            } catch (error) {
                professional.professionalDetails.certifications = [certifications]; // Assume plain string and wrap in an array
            }
        }

        if (licenseNumber) {
            professional.professionalDetails.licenseNumber = licenseNumber;
        }
        if (issuingMedicalBoard) {
            professional.professionalDetails.issuingMedicalBoard = issuingMedicalBoard;
        }
        if (yearsOfExperience) {
            professional.professionalDetails.yearsOfExperience = parseInt(yearsOfExperience, 10); // Convert to integer
        }

        // Update consultation fee if provided
        if (consultationFee !== undefined) {
            professional.consultationFee = consultationFee;
        }

        // Save the updated professional data
        await professional.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            professional,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Error updating profile' });
    }
};

// Create or update availability
exports.createOrUpdateAvailability = async (req, res) => {
    const { userId } = req.params;
    const { availability } = req.body;

    console.log('Request Payload:', { userId, availability });

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { $set: { slots: availability.map(slot => ({ ...slot, isBooked: false })) } },
            { new: true, upsert: true }
        );

        console.log('Updated Professional:', professional);

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Availability updated successfully',
            professional
        });
    } catch (error) {
        console.log("Error updating availability", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update consultation fee
exports.createOrUpdateConsultationFee = async (req, res) => {
    const { professionalId } = req.params;
    const { consultationFee } = req.body;

    if (typeof consultationFee !== 'number' || consultationFee < 0) {
        return res.status(400).json({ error: 'Invalid consultation fee' });
    }

    console.log('Request Payload:', { professionalId, consultationFee });

    try {
        const professional = await Professional.findOneAndUpdate(
            { _id: professionalId },
            { consultationFee },
            { new: true, upsert: true }
        );

        console.log('Updated Professional:', professional);

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Consultation fee updated successfully',
            professional
        });

    } catch (error) {
        console.log("Error updating consultation fee", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Create or update slots
exports.createOrUpdateSlots = async (req, res) => {
    const { userId } = req.params;
    const { slots } = req.body;

    try {
        const professional = await Professional.findOneAndUpdate(
            { user: userId },
            { slots: slots.map(slot => ({ ...slot, isBooked: false })) },
            { new: true, upsert: true }
        );

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        return res.status(200).json({
            message: 'Slots updated successfully',
            professional
        });
    } catch (error) {
        console.log("Error updating slots", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Get professionals by category
exports.getProfessionalsByCategory = async (req, res) => {
    const { category } = req.params;
    const allowedCategories = ['Kidney', 'Heart', 'Brain', 'Cancer', 'Skin', 'Bone'];

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    try {
        const professionals = await Professional.find({ category });
        res.status(200).json(professionals);
    } catch (error) {
        console.error('Error fetching professionals by category:', error);
        res.status(500).json({ message: 'Failed to fetch professionals' });
    }
};

// Get available slots
exports.getAvailableSlots = async (req, res) => {
    const { userId } = req.params;
    const { day } = req.query;

    try {
        const professional = await Professional.findOne({ user: userId });

        if (!professional) {
            return res.status(404).json({ error: 'Professional not found' });
        }

        let availableSlots = professional.slots.filter(slot => !slot.isBooked);
        if (day) {
            availableSlots = availableSlots.filter(slot => slot.day === day);
        }

        return res.status(200).json(availableSlots);
    } catch (error) {
        console.log("Error fetching available slots", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.searchProfessionals = async (req, res) => {
    const { query, specialty } = req.query;
    try {
        const professionals = await Professional.find({
            $and: [
                { $or: [{ firstName: new RegExp(query, 'i') }, { lastName: new RegExp(query, 'i') }] },
                specialty ? { specialty: new RegExp(specialty, 'i') } : {},
            ],
        }).populate('clinicId'); // Populate clinicId if needed
        res.status(200).json(professionals);
    } catch (error) {
        console.error('Error searching professionals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.practice = async (req, res) => {
  const { userId, practiceName, practiceLocation, profileImage, workingDays, workingHours, experience, insuranceProviders } = req.body;

  try {
    // Find the professional by userId
    const professional = await Professional.findOne({ user: userId });
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Update the professional's practice information
    professional.practiceName = practiceName;
    professional.practiceLocation = practiceLocation;
    professional.profileImage = profileImage;
    professional.workingDays = workingDays;
    professional.workingHours = workingHours;
    professional.experience = experience;
    professional.insuranceProviders = insuranceProviders;

    // Save the updated professional data
    await professional.save();

    return res.status(200).json({
      message: 'Practice information updated successfully',
      professional,
    });
  } catch (error) {
    console.error('Error updating practice information:', error);
    return res.status(500).json({ message: 'Error updating practice information' });
  }
};
exports.getProfileProgress = async (req, res) => {
  const { userId } = req.params; // The userId (professionalId)

  try {
    // Find the professional by userId
    const professional = await Professional.findOne({ user: userId });

    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Calculate the completion and missing fields for the Professional Details section
    const professionalDetails = professional.professionalDetails || {};
    const professionalDetailsFields = {
      medicalDegrees: professionalDetails.medicalDegrees,
      specialization: professionalDetails.specialization,
      certifications: professionalDetails.certifications,
      licenseNumber: professionalDetails.licenseNumber,
      issuingMedicalBoard: professionalDetails.issuingMedicalBoard,
      yearsOfExperience: professionalDetails.yearsOfExperience,
      consultationFee: professional.consultationFee
    };

    const completedProfessionalDetails = Object.keys(professionalDetailsFields).filter(
      key => professionalDetailsFields[key] && professionalDetailsFields[key].length > 0
    );
    const missingProfessionalDetails = Object.keys(professionalDetailsFields).filter(
      key => !professionalDetailsFields[key] || professionalDetailsFields[key].length === 0
    );

    const professionalDetailsProgress =
      (completedProfessionalDetails.length / Object.keys(professionalDetailsFields).length) * 100;

    // Calculate the completion and missing fields for the Practice Information section
    const practiceInfoFields = {
      practiceName: professional.practiceName,
      practiceLocation: professional.practiceLocation,
      profileImage: professional.profileImage,
      workingDays: professional.workingDays,
      workingHours: professional.workingHours,
      experience: professional.experience,
      insuranceProviders: professional.insuranceProviders
    };

    const completedPracticeInfo = Object.keys(practiceInfoFields).filter(
      key => practiceInfoFields[key] && practiceInfoFields[key].length > 0
    );
    const missingPracticeInfo = Object.keys(practiceInfoFields).filter(
      key => !practiceInfoFields[key] || practiceInfoFields[key].length === 0
    );

    const practiceInfoProgress =
      (completedPracticeInfo.length / Object.keys(practiceInfoFields).length) * 100;

    // Calculate overall progress
    const overallProgress = (professionalDetailsProgress + practiceInfoProgress) / 2;

    // Return response with missing fields
    return res.status(200).json({
      message: 'Profile progress fetched successfully',
      progress: {
        professionalDetails: {
          progress: professionalDetailsProgress,
          missingFields: missingProfessionalDetails
        },
        practiceInfo: {
          progress: practiceInfoProgress,
          missingFields: missingPracticeInfo
        },
        overall: overallProgress
      }
    });

  } catch (error) {
    console.error('Error fetching profile progress:', error);
    return res.status(500).json({ message: 'Error fetching profile progress' });
  }
};

