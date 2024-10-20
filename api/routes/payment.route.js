const express = require("express");
const { startPayment, createPayment, getPayment, handlePaymentWebhook, createSubaccount } = require("../controllers/payment.controller");

const router = express.Router();

// Start a payment
router.post('/start-payment', startPayment);

// Create a payment after payment verification (Post-Checkout)
router.post("/create-payment", createPayment);

// Get payment details by reference
router.get("/payment-details", getPayment);

// Webhook endpoint for Paystack notifications
router.post('/webhook', handlePaymentWebhook);

// Create a subaccount
router.post('/create-subaccount', createSubaccount);

module.exports = router;