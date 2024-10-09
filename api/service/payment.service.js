const axios = require('axios');
const Payment = require('../models/payment.model');
const _ = require('lodash');
const { initializePayment, verifyPayment } = require('../utils/payment')();

class PaymentService {
    startPayment(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const form = _.pick(data, ['amount', 'email', 'full_name']);
                form.metadata = {
                    full_name: form.full_name
                };
                form.amount *= 100; // Convert to the smallest currency unit

                console.log('Form data being sent:', form);  // Log the form data

                // Call to the payment initialization function
                initializePayment(form, (error, body) => {
                    if (error) {
                        console.error('Error in startPayment - PaymentService.js:', error);
                        return reject({
                            message: 'Error initializing payment',
                            source: 'PaymentService.js - startPayment',
                            details: error.message
                        });
                    }

                    console.log('Response body:', body); // Log response for debugging

                    try {
                        const response = typeof body === 'string' ? JSON.parse(body) : body;

                        // Check for the expected authorization URL
                        if (response && response.data && response.data.authorization_url) {
                            return resolve(response);
                        } else {
                            // Log the missing URL scenario
                            console.error('Missing authorization URL in response:', response);
                            return reject({
                                message: 'Missing authorization URL in payment response',
                                source: 'PaymentService.js - startPayment',
                                details: 'Response structure does not contain authorization_url',
                                response: response  // Log the full response for analysis
                            });
                        }
                    } catch (parseError) {
                        console.error('Error parsing payment response:', parseError);
                        return reject({
                            message: 'Error parsing payment response',
                            source: 'PaymentService.js - startPayment',
                            details: parseError.message
                        });
                    }
                });
            } catch (error) {
                console.error('Error in startPayment - PaymentService.js:', error);
                error.source = 'PaymentService.js - startPayment';
                return reject(error);
            }
        });
    }

    createPayment(req) {
        const ref = req.reference;
        if (ref === null) {
            return Promise.reject({
                code: 400,
                msg: 'No reference passed in query',
                source: 'PaymentService.js - createPayment'
            });
        }
        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(ref, (error, body) => {
                    if (error) {
                        console.error('Error in createPayment - PaymentService.js:', error);
                        return reject({
                            message: 'Error verifying payment',
                            source: 'PaymentService.js - createPayment',
                            details: error.message
                        });
                    }

                    console.log('Response body:', body); // Log response for debugging

                    try {
                        const response = typeof body === 'string' ? JSON.parse(body) : body;
                        const { reference, amount, status } = response.data;
                        const { email } = response.data.customer;
                        const full_name = response.data.metadata.full_name;
                        const newPayment = { reference, amount, email, full_name, status };
                        const payment = Payment.create(newPayment);

                        return resolve(payment);
                    } catch (parseError) {
                        console.error('Error parsing payment verification response:', parseError);
                        return reject({
                            message: 'Error parsing payment verification response',
                            source: 'PaymentService.js - createPayment',
                            details: parseError.message
                        });
                    }
                });
            } catch (error) {
                console.error('Error in createPayment - PaymentService.js:', error);
                error.source = 'PaymentService.js - createPayment';
                return reject(error);
            }
        });
    }

    paymentReceipt(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const reference = body.reference;
                const transaction = await Payment.findOne({ reference: reference });
                return resolve(transaction);
            } catch (error) {
                console.error('Error in paymentReceipt - PaymentService.js:', error);
                error.source = 'PaymentService.js - paymentReceipt';
                return reject(error);
            }
        });
    }
}

module.exports = PaymentService;
