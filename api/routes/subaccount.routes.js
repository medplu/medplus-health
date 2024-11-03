const express = require('express');
const router = express.Router();
const subaccountController = require('../controllers/sub_account.controller');

// Route to fetch subaccount info by user ID
router.get('/subaccount/:professionalId', subaccountController.getSubaccountByProfessionalId);


module.exports = router;