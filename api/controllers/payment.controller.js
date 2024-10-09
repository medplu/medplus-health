const PaymentService = require('../service/payment.service');
const ClinicAppointment = require('../models/clinic_appointment.model'); // Ensure correct model import
const paymentInstance = new PaymentService();

exports.startPayment = async (req, res) => {
    const { amount, email, full_name, userId, clinicId, date, time, notes } = req.body;

    if (!amount || !email || !full_name || !userId || !clinicId || !date || !time) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. Amount, email, full name, userId, clinicId, date, and time are required.' });
    }

    try {
        console.log('startPayment called with body:', req.body);

        // Create the appointment with status "pending"
        const appointment = new ClinicAppointment({
            userId,
            clinicId,
            date,
            time,
            notes,
            status: 'pending',
        });
        await appointment.save();

        const paymentData = {
            amount,
            email,
            metadata: {
                full_name,
                bookingId: appointment._id, // Pass the appointment ID as bookingId
            },
        };

        console.log('Form data being sent:', paymentData);

        const response = await paymentInstance.startPayment(paymentData);
        res.status(200).json({ status: 'Success', data: response.data.data });
    } catch (error) {
        console.error('Error in startPayment:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Payment initialization failed. Please try again later.',
            error: error.response ? error.response.data : error.message
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
        const response = await paymentInstance.createPayment(req.query);
        res.status(201).json({ status: 'Success', data: response });
    } catch (error) {
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
        const response = await paymentInstance.paymentReceipt(req.body);
        if (!response) {
            return res.status(404).json({ status: 'Failed', message: 'Payment not found.' });
        }
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
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

    if (event.event === 'charge.success') {
        const { reference, metadata } = event.data;

        console.log('Webhook event data:', event.data);

        try {
            // Retrieve the appointment using the booking ID from metadata
            const appointment = await ClinicAppointment.findById(metadata.bookingId);
            if (!appointment) {
                return res.status(404).send('Appointment not found.');
            }

            // Update the appointment status to "confirmed"
            appointment.paymentId = reference; // Save the payment reference
            appointment.status = 'confirmed';
            await appointment.save();

            console.log('Appointment confirmed successfully');
        } catch (error) {
            console.error('Error processing payment webhook:', error.response ? error.response.data : error.message);
            return res.status(500).send('Internal Server Error while processing payment webhook.');
        }
    } else {
        console.warn('Unhandled event type:', event.event);
    }

    res.status(200).send('Webhook received');
};