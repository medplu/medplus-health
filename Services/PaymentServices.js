import axios from 'axios';

const PAYMENT_BASE_URL = 'https://medplus-app.onrender.com/api/payment';

export const initiatePayment = async (amount, email, fullName, userId, clinicId, date, time, appointmentId) => {
  try {
    const response = await axios.post(`${PAYMENT_BASE_URL}/start-payment`, {
      amount,
      email,
      full_name: fullName,
      userId,
      clinicId,
      date,
      time,
      appointmentId
    });
    return response.data.data.data.authorization_url; 
  } catch (error) {
    throw new Error('Failed to initiate payment');
  }
};

export const verifyPayment = async (reference) => {
  try {
    const response = await axios.post(`${PAYMENT_BASE_URL}/create-payment`, { reference });
    return response.data; 
  } catch (error) {
    throw new Error('Payment verification failed');
  }
};