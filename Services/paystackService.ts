// Services/paystackService.ts
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;

const AxiosInstance = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const fetchTransactions = async (subaccount: string) => {
  try {
    const response = await AxiosInstance.get('/transaction', {
      params: { subaccount },
    });
    if (response.data.status) {
      return response.data.data; // Return the list of transactions
    } else {
      throw new Error('Failed to fetch transactions');
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};