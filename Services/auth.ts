// api/auth.ts
import axios from 'axios';

const API_URL = 'https://medplus-health.onrender.com/api';

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  gender?: 'Male' | 'Female' | 'Other'; 
  userType?: 'client' | 'professional' | 'student'; 
  profession?: string;
  profileImage?: string; 
}) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Signup failed. Please try again.';
  }
};

export const verifyEmail = async (email: string, verificationCode: string) => {
  try {
    const response = await axios.post(`${API_URL}/verify-email`, { email, verificationCode });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Verification failed. Please try again.';
  }
};

export const checkUserExists = async (email: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/exists`, { params: { email } });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error checking user existence. Please try again.';
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed. Please try again.';
  }
};