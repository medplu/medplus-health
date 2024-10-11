import axios from 'axios';

const BASE_URL = "https://medplus-app.onrender.com/api"; // Update to your backend API base
const API_KEY = '22aa7adcfa0dedae84f6deded16bdf1794bc084d97ea1d8816a646333276d8441044fa280f68b87651d3421f571d0e383c452df2ba7cf11b5a8bedd27b51f9712e4d68d518f2940c190cf9b66f64717597438561a4163def7ee3c25fd213ebfce4c2d206b3f657449744f568472ac3917220d07b1adc336320d9cb6d20d77c';

const AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': 'Bearer ' + API_KEY
    }
});

// Existing API functions
const getSlider = () => AxiosInstance.get('/sliders?populate=*');
const getCategories = () => AxiosInstance.get("/categories"); // Update to fetch from your backend
const getClinics = () => AxiosInstance.get("/clinics"); // Update to fetch from your backend

// New logic for fetching doctors
const createAppointement = (data) => AxiosInstance.post('/appointments', data);
const getUserAppointements = (email) => AxiosInstance.get(`/appointments?email=${email}`);

// Updated function to fetch doctors by category
const getDoctorsByCategory = (category) => AxiosInstance.get(`/professionals/category/${category}`);
const getAllClinics= () => AxiosInstance.get("/clinics");
const getAllDoctors = () => AxiosInstance.get("/doctors");

// New function to fetch clinics by category
const getClinicsByCategory = (category) => AxiosInstance.get(`/clinics?category=${category}`);

// Authentication functions using BASE_URL
const register = (data) => AxiosInstance.post('/auth/local/register', data); // Add register function
const login = (data) => AxiosInstance.post('/auth/local', data); // Update login function
const googleOAuthCallback = (code) => AxiosInstance.post('/auth/google/callback', { code });

// New function to save a doctor to Strapi
const saveDoctor = (doctorData) => AxiosInstance.post('/doctors', doctorData);

// New function to register a clinic
const registerClinic = (userId, data) => AxiosInstance.post(`/clinics/register/${userId}`, data);

// New function to book a doctor
const bookDoctor = (doctorId) => AxiosInstance.post('/bookings', { doctorId });

// New login function
const loginUser = (email, password) => AxiosInstance.post('/login', { email, password });

// New function to fetch a single doctor by doctorId
const getDoctorById = (doctorId) => AxiosInstance.get(`/api/professionals/${doctorId}`);

export default {
    getSlider,
    getCategories, // Updated function
    getClinics, // Updated function
    getClinicsByCategory, // Updated function
    loginUser,
    getDoctorsByCategory, // Updated function
    createAppointement,
    getAllClinics,
    getAllDoctors,
    getUserAppointements,
    register, // Export the new function
    login, // Export the updated function
    googleOAuthCallback, // Export the new function
    saveDoctor, // Export the new function
    registerClinic, // Export the new function
    bookDoctor, // Export the new bookDoctor function
    getDoctorById // Export the new function
};