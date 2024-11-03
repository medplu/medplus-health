const mongoose = require('mongoose');
const Subaccount = require('../models/sub_account.model');
const { v4: uuidv4 } = require('uuid'); // Import UUID for generating unique subaccount codes

exports.getSubaccountByProfessionalId = async (req, res) => {
  let { professionalId } = req.params;

  // Log the entire request object for debugging
  console.log('Request params:', req.params);
  console.log('Request URL:', req.originalUrl);

  try {
    // Log the received professionalId for debugging
    console.log('Received professionalId:', professionalId);

    // Ensure that professionalId is a valid ObjectId before proceeding
    if (!mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({ status: 'Failed', message: 'Invalid professional ID format' });
    }

    // Convert the professionalId to a new ObjectId instance
    const objectId = new mongoose.Types.ObjectId(professionalId);

    // Find the subaccount associated with this professional
    const subaccount = await Subaccount.findOne({ professional: objectId });
    if (!subaccount) {
      return res.status(404).json({ status: 'Failed', message: 'Subaccount not found' });
    }

    // Ensure the subaccount data includes the necessary fields
    res.status(200).json({ 
      status: 'Success', 
      data: {
        id: subaccount._id,
        business_name: subaccount.business_name,
        account_number: subaccount.account_number,
        percentage_charge: subaccount.percentage_charge,
        settlement_bank: subaccount.settlement_bank,
        currency: subaccount.currency,
        subaccount_code: subaccount.subaccount_code,
        professional: subaccount.professional,
        createdAt: subaccount.createdAt,
        updatedAt: subaccount.updatedAt
      } 
    });
  } catch (error) {
    console.error('Error fetching subaccount:', error);
    res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
};

// exports.createSubaccount = async (req, res) => {
//   const { professionalId, business_name, account_number, percentage_charge, settlement_bank, currency } = req.body;

//   try {
//     // Ensure that professionalId is a valid ObjectId before proceeding
//     if (!mongoose.Types.ObjectId.isValid(professionalId)) {
//       return res.status(400).json({ status: 'Failed', message: 'Invalid professional ID format' });
//     }

//     // Check if a subaccount already exists for this professional
//     const existingSubaccount = await Subaccount.findOne({ professional: professionalId });
//     if (existingSubaccount) {
//       return res.status(400).json({ status: 'Failed', message: 'Subaccount already exists for this professional' });
//     }

//     // Generate a unique subaccount_code
//     const subaccount_code = uuidv4(); // Generates a unique identifier

//     // Create a new subaccount
//     const newSubaccount = new Subaccount({
//       professional: professionalId,
//       business_name,
//       account_number,
//       percentage_charge,
//       settlement_bank,
//       currency: currency || 'KES', // Default to 'KES' if currency not provided
//       subaccount_code, // Set the generated subaccount_code
//     });

//     // Save the new subaccount to the database
//     await newSubaccount.save();

//     // Return the created subaccount data
//     res.status(201).json({ status: 'Success', data: newSubaccount });
//   } catch (error) {
//     console.error('Error creating subaccount:', error);
//     res.status(500).json({ status: 'Failed', message: 'Internal server error' });
//   }
// };
