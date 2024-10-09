const PaymentService = require('../service/payment.service');
const PaymentModel = require('../models/payment.model'); 
 
const ClinicAppointmentModel = require('../models/appointment.model'); 
const paymentInstance = new PaymentService();
exports.startPayment = async (req, res) => {
    const { amount, email, full_name, userId, clinicId, date, time } = req.body;

    if (!amount || !email || !full_name || !userId || !clinicId || !date || !time) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. Amount, email, full name, userId, clinicId, date, and time are required.' });
    }

    try {
        console.log('startPayment called with body:', req.body);

        const paymentData = {
            amount,
            email,
            metadata: {
                full_name,
                amount,
                userId,
                clinicId,
                date,
                time,
            },
        };

        const response = await paymentInstance.startPayment(paymentData);
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
        console.error('Error in startPayment:', error);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.createPayment = async (req, res) => {
    const { reference } = req.query;

    if (!reference) {
        return res.status(400).json({ status: 'Failed', message: 'Missing payment reference in query.' });
    }

    try {
        console.log('createPayment called with query:', req.query);
        const response = await paymentInstance.createPayment(req.query);
        res.status(201).json({ status: 'Success', data: response });
    } catch (error) {
        console.error('Error in createPayment:', error);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};

exports.getPayment = async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ status: 'Failed', message: 'Missing payment reference in body.' });
    }

    try {
        console.log('getPayment called with body:', req.body);
        const response = await paymentInstance.paymentReceipt(req.body);
        if (!response) {
            return res.status(404).json({ status: 'Failed', message: 'Payment not found.' });
        }
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
        console.error('Error in getPayment:', error);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
exports.handlePaymentWebhook = async (req, res) => {
    const event = req.body;

    console.log('Webhook event data:', event);

    if (event.event === 'charge.success') {
        const { reference, status, customer, metadata } = event.data;

        console.log('Webhook metadata:', metadata);

        // Log each field in metadata to verify their presence
        console.log('Metadata full_name:', metadata.full_name);
        console.log('Metadata amount:', metadata.amount);
        console.log('Metadata userId:', metadata.userId);
        console.log('Metadata clinicId:', metadata.clinicId);
        console.log('Metadata date:', metadata.date);
        console.log('Metadata time:', metadata.time);

        if (!metadata || !metadata.full_name || !metadata.amount || !metadata.userId || !metadata.clinicId || !metadata.date || !metadata.time) {
            console.error('Missing required metadata fields');
            return res.status(400).send('Bad Request: Missing required metadata fields');
        }

        try {
            const existingPayment = await PaymentModel.findOne({ reference });
            if (!existingPayment) {
                const payment = new PaymentModel({
                    full_name: metadata.full_name,
                    email: customer.email,
                    amount: metadata.amount,
                    reference,
                    status,
                    metadata,
                });
                await payment.save();

                const clinicAppointment = new ClinicAppointmentModel({
                    userId: metadata.userId,
                    clinicId: metadata.clinicId, 
                    date: metadata.date,
                    time: metadata.time,
                    paymentId: payment._id, 
                });
                await clinicAppointment.save(); 
            }
        } catch (error) {
            console.error('Error processing payment webhook:', error);
            return res.status(500).send('Internal Server Error');
        }
    }

    res.status(200).send('Webhook received');
};