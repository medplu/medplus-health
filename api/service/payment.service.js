const axios = require('axios');
const Payment = require('../models/payment.model');
const Subaccount = require('../models/sub_account.model');
const _ = require('lodash');
const { initializePayment, verifyPayment, createSubaccount } = require('../utils/payment')();

class PaymentService {
    startPayment(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Validate input data
                const requiredFields = ['amount', 'email', 'full_name', 'userId', 'clinicId', 'date', 'time', 'appointmentId'];
                for (const field of requiredFields) {
                    if (!data[field]) {
                        return reject(`Missing required field: ${field}`);
                    }
                }
    
                // Picking relevant fields from data
                const form = _.pick(data, requiredFields);
    
                // Add more metadata if required by your application logic
                form.metadata = {
                    full_name: form.full_name,
                    userId: form.userId,
                    clinicId: form.clinicId,
                    date: form.date,
                    time: form.time,
                    appointmentId: form.appointmentId,
                };
    
                // Convert the amount to the expected format (if required by payment gateway)
                form.amount *= 100;
    
                // Log the form data for debugging
                console.log('Form data being sent:', form);
    
                // Call initializePayment with the form data
                initializePayment(form, (error, body) => {
                    if (error) {
                        console.error('Error initializing payment:', error); // Log error
                        return reject(`Payment initialization error: ${error.message}`);
                    }
    
                    // Log the body response for debugging
                    console.log('Response body:', body);
    
                    try {
                        // Parse body only if it's a string
                        const response = typeof body === 'string' ? JSON.parse(body) : body;
    
                        // Check if response is a valid object
                        if (typeof response === 'object' && response !== null) {
                            return resolve(response);
                        } else {
                            console.error('Unexpected response format:', response);  // Log error
                            return reject('Unexpected response format received');
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError);  // Log parsing error
                        return reject('Error parsing response: ' + parseError.message);
                    }
                });
            } catch (error) {
                // Log unexpected errors that occur in the try block
                console.error('Unexpected error in startPayment:', error);
                error.source = 'Start Payment Service';
                return reject(error);
            }
        });
    }
    
    async fetchTransactionByReference(reference) {
        try {
            const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            });
            return response.data; // Contains transaction details
        } catch (error) {
            console.error('Error fetching transaction:', error.response ? error.response.data : error.message);
            throw new Error('Unable to fetch transaction details');
        }
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

    async createSubaccount(data) {
        return new Promise(async (resolve, reject) => {
            try {
                // Call createSubaccount with the provided data
                createSubaccount(data, async (error, body) => {
                    if (error) {
                        console.error('Error creating subaccount:', error); // Log error
                        return reject(`Subaccount creation error: ${error.message}`);
                    }
    
                    // Log the body response for debugging
                    console.log('Response body:', body);
    
                    try {
                        // Parse body only if it's a string
                        const response = typeof body === 'string' ? JSON.parse(body) : body;
    
                        // Check if response is a valid object
                        if (typeof response === 'object' && response !== null) {
                            // Prepare the data for storage
                            const subaccountData = {
                                business_name: response.data.business_name,
                                account_number: response.data.account_number,
                                percentage_charge: parseFloat(response.data.percentage_charge), // Ensure it's a number
                                settlement_bank: response.data.settlement_bank,
                                currency: response.data.currency,
                                subaccount_code: response.data.subaccount_code,
                                professional: data.professionalId, // Changed from 'user' to 'professional'
                            };
    
                            // Save subaccount data to the database
                            const newSubaccount = await Subaccount.create(subaccountData);
    
                            console.log('Subaccount saved successfully:', newSubaccount);
                            return resolve({ ...response, saved: newSubaccount });
                        } else {
                            console.error('Unexpected response format:', response); // Log error
                            return reject('Unexpected response format received');
                        }
                    } catch (parseError) {
                        console.error('Error parsing response:', parseError); // Log parsing error
                        return reject('Error parsing response: ' + parseError.message);
                    }
                });
            } catch (error) {
                // Log unexpected errors that occur in the try block
                console.error('Unexpected error in createSubaccount:', error);
                error.source = 'Create Subaccount Service';
                return reject(error);
            }
        });
    }
    
}

module.exports = PaymentService;