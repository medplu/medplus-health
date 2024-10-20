const mongoose = require('mongoose');
const Subaccount = require('../models/sub_account.model');

exports.getSubaccountByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    // Ensure that userId is a valid ObjectId before proceeding
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: 'Failed', message: 'Invalid user ID format' });
    }

    // Convert the userId to a new ObjectId instance
    const objectId = new mongoose.Types.ObjectId(userId);

    // Find the subaccount associated with this user
    const subaccount = await Subaccount.findOne({ user: objectId });
    if (!subaccount) {
      return res.status(404).json({ status: 'Failed', message: 'Subaccount not found' });
    }

    // Return the found subaccount data
    res.status(200).json({ status: 'Success', data: subaccount });
  } catch (error) {
    console.error('Error fetching subaccount:', error);
    res.status(500).json({ status: 'Failed', message: 'Internal server error' });
  }
};
