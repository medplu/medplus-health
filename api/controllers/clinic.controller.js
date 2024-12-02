const Clinic = require('../models/clinic.model');
const Professional = require('../models/professional.model'); 
const cloudinary = require('cloudinary').v2; // Use require for cloudinary
const ClinicImage = require('../models/clinic_image.model');

const generateReferenceCode = () => {
  // Simple example: generating a unique reference code
  return 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};
const specialtyMapping = {
  cardiology: 'Heart',                // Cardiology → Heart
  dermatology: 'Skin',                // Dermatology → Skin
  endocrinology: 'Hormones',          // Endocrinology → Hormones
  gastroenterology: 'Digestive System', // Gastroenterology → Digestive System
  hematology: 'Blood',                // Hematology → Blood
  nephrology: 'Kidneys',              // Nephrology → Kidneys
  neurology: 'Brain & Nerves',        // Neurology → Brain & Nerves
  oncology: 'Cancer',                 // Oncology → Cancer
  orthopedics: 'Bones & Joints',      // Orthopedics → Bones & Joints
  pediatrics: 'Children’s Health',    // Pediatrics → Children’s Health
  psychiatry: 'Mental Health',        // Psychiatry → Mental Health
  radiology: 'Imaging & X-rays',      // Radiology → Imaging & X-rays
  rheumatology: 'Joint & Muscle Disorders', // Rheumatology → Joint & Muscle Disorders
  urology: 'Urinary System',          // Urology → Urinary System
  anesthesiology: 'Anesthesia',       // Anesthesiology → Anesthesia
  emergency_medicine: 'Emergency Care', // Emergency Medicine → Emergency Care
  obstetrics_gynecology: 'Women’s Health', // Obstetrics & Gynecology → Women’s Health
  ophthalmology: 'Eyes',              // Ophthalmology → Eyes
  otolaryngology: 'Ear, Nose & Throat', // Otolaryngology → Ear, Nose & Throat
  pathology: 'Disease Diagnosis',     // Pathology → Disease Diagnosis
  plastic_surgery: 'Cosmetic Surgery', // Plastic Surgery → Cosmetic Surgery
  public_health: 'Public Health',     // Public Health → Public Health
  surgery: 'General Surgery',         // Surgery → General Surgery
  thoracic_surgery: 'Chest Surgery',  // Thoracic Surgery → Chest Surgery
  vascular_surgery: 'Blood Vessel Surgery', // Vascular Surgery → Blood Vessel Surgery
  geriatrics: 'Elderly Care',         // Geriatrics → Elderly Care
  family_medicine: 'Family Care',     // Family Medicine → Family Care
  internal_medicine: 'Internal Medicine', // Internal Medicine → Internal Medicine
  sports_medicine: 'Sports Injury Care', // Sports Medicine → Sports Injury Care
  chiropractic: 'Spinal Care',        // Chiropractic → Spinal Care
  podiatry: 'Foot Care',              // Podiatry → Foot Care
  dentistry: 'Teeth',                 // Dentistry → Teeth
  pharmacology: 'Medication',         // Pharmacology → Medication
  immunology: 'Immune System',        // Immunology → Immune System
  infectious_diseases: 'Infections',  // Infectious Diseases → Infections
  pain_management: 'Pain Relief',     // Pain Management → Pain Relief
  addiction_medicine: 'Addiction',    // Addiction Medicine → Addiction
  sleep_medicine: 'Sleep Disorders',  // Sleep Medicine → Sleep Disorders
  genetics: 'Genetics',               // Genetics → Genetics
  clinical_nutrition: 'Nutrition',    // Clinical Nutrition → Nutrition
  microbiology: 'Microorganisms',     // Microbiology → Microorganisms
  bariatrics: 'Weight Management',    // Bariatrics → Weight Management
  fertility: 'Fertility',             // Fertility → Fertility
  neurosurgery: 'Brain Surgery',      // Neurosurgery → Brain Surgery
  palliative_care: 'End-of-Life Care', // Palliative Care → End-of-Life Care
  critical_care: 'Intensive Care',    // Critical Care → Intensive Care
  transplant_surgery: 'Organ Transplant', // Transplant Surgery → Organ Transplant
  forensic_medicine: 'Forensic Medicine' // Forensic Medicine → Forensic Medicine
};

const registerClinic = async (req, res) => {
  const { professionalId } = req.params;
  const {
    name,
    contactInfo,
    address,
    images,
    insuranceCompanies,
    specialties, 
    education,
    experiences,
    languages,
    assistantName,
    assistantPhone,
    bio,
    certificateUrl
  } = req.body;

  try {
    const mappedSpecialty = specialtyMapping[specialties] || specialties;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).send({ message: 'Professional not found' });
    }

    professional.specialty = mappedSpecialty;
    professional.contactInfo = contactInfo;
    await professional.save();

    const referenceCode = generateReferenceCode();
    const clinic = new Clinic({
      name,
      contactInfo,
      address,
      images: Array.isArray(images) ? images : [],
      referenceCode,
      professionals: [],
      insuranceCompanies,
      specialties: mappedSpecialty, 
      education,
      experiences,
      languages,
      assistantName,
      assistantPhone,
      bio,
      certificateUrl
    });

    await clinic.save();
    professional.clinicId = clinic._id;
    professional.attachedToClinic = true;
    await professional.save();
    clinic.professionals.push(professional._id);
    await clinic.save();

    res.status(201).send(clinic);
  } catch (error) {
    console.error('Error creating clinic or updating professional:', error);
    res.status(500).send({ message: 'Error creating clinic', error });
  }
};

const fetchClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find()
      .populate({
        path: 'professionals', // Populate the 'professionals' field
        populate: [
          { path: 'user' },  // Populate user details if necessary
        ]
      })
      .populate('clinicImages')  // Directly populate the virtual 'clinicImages' field
      .exec();  // Execute the query

    res.status(200).send(clinics);
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).send({ message: 'Error fetching clinics', error });
  }
};




const joinClinic = async (req, res) => {
  const { professionalId } = req.params;
  const { referenceCode } = req.body;

  try {
    const clinic = await Clinic.findOne({ referenceCode });
    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found with the provided reference code' });
    }

    const professional = await Professional.findById(professionalId).populate('user');
    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    if (professional.attachedToClinic) {
      return res.status(400).json({ error: 'You are already attached to a clinic' });
    }

    clinic.professionals.push(professional._id);
    await clinic.save();

    await Professional.findByIdAndUpdate(
      professionalId,
      {
        clinic: clinic._id,
        attachedToClinic: true,
      },
      { new: true }
    );

    res.status(200).json({ message: 'Successfully joined the clinic', clinic });
  } catch (error) {
    console.error('Error joining clinic:', error);
    res.status(500).send(error);
  }
};

const fetchClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate({
      path: 'professionals',
      populate: [
        { path: 'user' },
        { path: 'clinic_images', model: 'ClinicImage' } // Ensure the model is specified
      ]
    });
    if (!clinic) {
      return res.status(404).send({ message: 'Clinic not found' });
    }
    res.status(200).send(clinic);
  } catch (error) {
    console.error('Error fetching clinic by ID:', error);
    res.status(500).send({ message: 'Error fetching clinic by ID', error });
  }
};

const fetchClinicsBySpecialties = async (req, res) => {
  const { specialty } = req.params;
  try {
    const clinics = await Clinic.find({ specialties: specialty }).populate({
      path: 'professionals',
      populate: { path: 'user' }
    });
    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error fetching clinics by specialties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const searchClinics = async (req, res) => {
  const { query, specialty, address } = req.query;
  try {
    const clinics = await Clinic.find({
      $and: [
        { name: new RegExp(query, 'i') },
        specialty ? { specialties: new RegExp(specialty, 'i') } : {},
        address ? { address: new RegExp(address, 'i') } : {},
      ],
    }).populate({
      path: 'professionals',
      populate: { path: 'user' }
    }).populate('professionals'); // Ensure professionals are populated with complete objects
    res.status(200).json(clinics);
  } catch (error) {
    console.error('Error searching clinics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerClinic,
  fetchClinics,
  fetchClinicById,
  joinClinic,
  fetchClinicsBySpecialties,
  searchClinics,
};

