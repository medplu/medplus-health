const PaymentService = require('../service/payment.service');
const paymentInstance = new PaymentService();

exports.startPayment = async (req, res) => {
    const { amount, email, full_name } = req.body;

    if (!amount || !email || !full_name) {
        return res.status(400).json({ status: 'Failed', message: 'Invalid input data. Amount, email, and full name are required.' });
    }

    try {
        console.log('startPayment called with body:', req.body);
        const response = await paymentInstance.startPayment(req.body);
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
        const response = await paymentInstance.paymentReciept(req.body);
        if (!response) {
            return res.status(404).json({ status: 'Failed', message: 'Payment not found.' });
        }
        res.status(200).json({ status: 'Success', data: response });
    } catch (error) {
        console.error('Error in getPayment:', error);
        res.status(500).json({ status: 'Failed', message: error.message });
    }
};
