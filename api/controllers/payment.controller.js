const PaymentService = require('../service/payment.service');
const PaymentModel = require('../models/payment.model');
const ClinicAppointmentModel = require('../models/appointment.model');
const SubaccountModel = require('../models/sub_account.model'); // Import the Subaccount model
const paymentInstance = new PaymentService();

exports.startPayment = async (req, res) => {
    const { amount, email, full_name, userId, clinicId, date, time, appointmentId } = req.body;

    if (!amount || !email || !full_name || !userId || !clinicId || !date || !time || !appointmentId) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. Amount, email, full name, userId, clinicId, date, and time are required.' });
    }

    try {
        console.log('startPayment called with body:', req.body);

        // Retrieve the subaccount code from the database
        const subaccount = await SubaccountModel.findOne({ user: userId });
        if (!subaccount) {
            return res.status(404).json({ status: 'Failed', message: 'Subaccount not found for the user' });
        }

        const paymentData = {
            amount,
            email,
            full_name,
            userId,
            clinicId,
            date,
            time,
            appointmentId,
            subaccount: subaccount.subaccount_code, // Include the subaccount code
            metadata: {
                full_name,
                amount,
                userId,
                clinicId,
                date,
                time,
                appointmentId,
            },
        };

        console.log('Form data being sent:', paymentData);

        const response = await paymentInstance.startPayment(paymentData);
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
        // Enhanced error handling
        console.error('Error in startPayment:', error); // Log the actual error object
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Payment initialization failed. Please try again later.',
            error: error.response ? error.response.data : error.message || error.toString()
        });
    }
};

exports.createPayment = async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        return res.status(400).json({ status: 'Failed', message: 'Missing payment reference in query.' });
    }

    try {
        console.log('createPayment called with query:', req.query);
        
        // Fetch transaction details using the reference
        const transactionDetails = await paymentInstance.fetchTransactionByReference(reference);

        // Handle the transaction details as needed (e.g., save to your database)
        res.status(201).json({ status: 'Success', data: transactionDetails });
    } catch (error) {
        // Enhanced error handling
        console.error('Error in createPayment:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Payment creation failed. Please try again later.',
            error: error.response ? error.response.data : error.message
        });
    }
};

exports.getPayment = async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ status: 'Failed', message: 'Missing payment reference in body.' });
    }

    try {
        console.log('getPayment called with body:', req.body);

        // Fetch transaction details using the reference
        const transactionDetails = await paymentInstance.fetchTransactionByReference(reference);

        if (!transactionDetails) {
            return res.status(404).json({ status: 'Failed', message: 'Payment not found.' });
        }

        res.status(200).json({ status: 'Success', data: transactionDetails });
    } catch (error) {
        // Enhanced error handling
        console.error('Error in getPayment:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Failed to retrieve payment details. Please try again later.',
            error: error.response ? error.response.data : error.message
        });
    }
};

exports.handlePaymentWebhook = async (req, res) => {
    const event = req.body;

    console.log('Webhook event data:', event);

    // Check if the event is a successful charge
    if (event.event === 'charge.success') {
        const { reference, status, customer, metadata } = event.data;

        console.log('Webhook event data:', event.data);
        console.log('Webhook metadata:', metadata);

        // Ensure required fields are present in the metadata
        if (!metadata || !metadata.full_name || !metadata.amount || !metadata.userId || !metadata.clinicId || !metadata.date || !metadata.time) {
            console.error('Missing required metadata fields');
            return res.status(400).send('Bad Request: Missing required metadata fields');
        }

        try {
            // Check if the payment already exists
            const existingPayment = await PaymentModel.findOne({ reference });
            if (!existingPayment) {
                // Check for duplicate appointment
                const existingAppointment = await ClinicAppointmentModel.findOne({
                    clinicId: metadata.clinicId,
                    userId: metadata.userId,
                    date: metadata.date,
                    time: metadata.time
                });

                if (existingAppointment) {
                    console.warn('Duplicate appointment detected for clinic:', metadata.clinicId, 'user:', metadata.userId, 'date:', metadata.date, 'time:', metadata.time);
                    return res.status(409).send('Conflict: Appointment already exists for the selected time and clinic.');
                }

                // Create new payment record
                const payment = new PaymentModel({
                    full_name: metadata.full_name,
                    email: customer.email,
                    amount: metadata.amount,
                    reference,
                    status,
                    metadata,
                });
                await payment.save();

                // Create new appointment record
                const clinicAppointment = new ClinicAppointmentModel({
                    userId: metadata.userId,
                    clinicId: metadata.clinicId,
                    date: metadata.date,
                    time: metadata.time,
                    paymentId: payment._id, 
                });
                await clinicAppointment.save();

                console.log('Payment and appointment created successfully');
            } else {
                console.log('Payment already processed for reference:', reference);
            }
        } catch (error) {
            console.error('Error processing payment webhook:', error.response ? error.response.data : error.message);
            return res.status(500).send('Internal Server Error while processing payment webhook.');
        }
    } else {
        console.warn('Unhandled event type:', event.event);
    }

    // Respond to Paystack that the webhook was received successfully
    res.status(200).send('Webhook received');
};

// New method to create a subaccount
exports.createSubaccount = async (req, res) => {
    const { business_name, settlement_bank, account_number, percentage_charge, professionalId } = req.body;

    if (!business_name || !settlement_bank || !account_number || !percentage_charge || !professionalId) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. Business name, settlement bank, account number, percentage charge, and userId are required.' });
    }

    try {
        console.log('createSubaccount called with body:', req.body);

        const subaccountData = {
            business_name,
            settlement_bank,
            account_number,
            percentage_charge,
            professionalId, // Include professionalId in the subaccount data
        };

        console.log('Subaccount data being sent:', subaccountData);

        const response = await paymentInstance.createSubaccount(subaccountData);
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
        // Enhanced error handling
        console.error('Error in createSubaccount:', error); // Log the actual error object
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Subaccount creation failed. Please try again later.',
        });
    }
};