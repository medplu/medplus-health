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
                form.amount *= 100;

                console.log('Form data being sent:', form);  // Log the form data

                initializePayment(form, (error, body) => {
                    if (error) {
                        return reject(error.message);
                    }

                    // Log the body for debugging
                    console.log('Response body:', body);  

                    try {
                        // If body is an object, no need to parse it
                        const response = typeof body === 'string' ? JSON.parse(body) : body;

                        // Check if the response is an object and has the expected structure
                        if (typeof response === 'object' && response !== null) {
                            return resolve(response);
                        } else {
                            return reject('Unexpected response format');
                        }
                    } catch (parseError) {
                        return reject('Error parsing response: ' + parseError.message);
                    }
                });
            } catch (error) {
                error.source = 'Start Payment Service';
                return reject(error);
            }
        });
    }

    createPayment(req) {
        const ref = req.reference;
        if (ref === null) {
            return Promise.reject({ code: 400, msg: 'No reference passed in query' });
        }
        return new Promise(async (resolve, reject) => {
            try {
                verifyPayment(ref, (error, body) => {
                    if (error) {
                        return reject(error.message);
                    }

                    // Log the body for debugging
                    console.log('Response body:', body); 

                    try {
                        const response = typeof body === 'string' ? JSON.parse(body) : body;

                        const { reference, amount, status } = response.data;
                        const { email } = response.data.customer;
                        const full_name = response.data.metadata.full_name;
                        const newPayment = { reference, amount, email, full_name, status };
                        const payment = Payment.create(newPayment);

                        return resolve(payment);
                    } catch (parseError) {
                        return reject('Error parsing response: ' + parseError.message);
                    }
                });
            } catch (error) {
                error.source = 'Create Payment Service';
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
                error.source = 'Payment Receipt';
                return reject(error);
            }
        });
    }
}

module.exports = PaymentService;
