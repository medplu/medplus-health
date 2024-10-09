// controllers/clinic_appointment.controller.js
const ClinicAppointment = require('../models/clinic_appointment.model'); // Import the ClinicAppointment model
const PaymentService = require('../service/payment.service');
const paymentInstance = new PaymentService();

exports.createAppointmentAndStartPayment = async (req, res) => {
    const { userId, clinicId, date, time, amount, email, full_name } = req.body;

    if (!userId || !clinicId || !date || !time || !amount || !email || !full_name) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. All fields are required.' });
    }

    try {
        // Create the appointment with status "pending"
        const appointment = new ClinicAppointment({
            userId,
            clinicId,
            date,
            time,
            paymentId: null, // Initially set to null, will be updated after payment
        });
        await appointment.save();

        // Trigger the payment process
        const paymentData = {
            amount,
            email,
            metadata: {
                full_name,
                bookingId: appointment._id, // Pass the appointment ID as bookingId
            },
        };

        const response = await paymentInstance.startPayment(paymentData);

        res.status(200).json({ status: 'Success', data: response.data.data });
    } catch (error) {
        console.error('Error in createAppointmentAndStartPayment:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            status: 'Failed', 
            message: 'Appointment creation or payment initialization failed. Please try again later.',
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