import axios from 'axios';
import { RootState } from '../app/store/configureStore'; // Adjust path according to your store file
import { useSelector } from 'react-redux';

const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;

export const handleBookPress = async (
  userId: string,
  consultationFee: number,
  selectedTimeSlot: string,
  selectedDate: string
) => {
  const user = useSelector((state: RootState) => state.user);
  let isSubmitting = false;
  let showAlert = false;
  let alertMessage = '';
  let alertType: 'success' | 'error' = 'success';
  let appointmentId: string | null = null;
  let subaccountCode: string | null = null;

  const validateUserId = (id: string): boolean => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };

  const fetchSubaccountCode = async (userId: string) => {
    try {
      console.log('Fetching subaccount code for userId:', userId);
      const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${userId}`);
      if (response.data.status === 'Success') {
        const { subaccount_code } = response.data.data;
        subaccountCode = subaccount_code;
        console.log('Fetched subaccount code:', subaccount_code);
      } else {
        console.error('Failed to fetch subaccount code:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch subaccount code:', error);
    }
  };

  isSubmitting = true;
  try {
    console.log('Booking appointment with professionalId:', userId);

    // Check if subaccountCode and user.email are valid
    if (!subaccountCode || !user.email) {
      throw new Error('Missing subaccount code or user email.');
    }

    // Create appointment
    const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
      doctorId: userId,
      userId: user.userId,
      patientName: `${user.firstName} ${user.lastName}`,
      date: selectedDate,
      time: selectedTimeSlot,
      status: 'pending',
    });

    console.log('Appointment response:', appointmentResponse.data); // Log the entire response

    const newAppointmentId = appointmentResponse.data._id; // Extract the appointmentId from the response
    console.log('New Appointment ID:', newAppointmentId); // Log the ID

    if (!newAppointmentId) {
      throw new Error('Failed to retrieve appointmentId from response');
    }
    appointmentId = newAppointmentId;
    console.log('Created appointment with appointmentId:', newAppointmentId);

    // Skip payment initialization and transaction steps
    alertMessage = 'Appointment created successfully.';
    alertType = 'success';
    showAlert = true;
    isSubmitting = false;
  } catch (error) {
    console.error('Failed to book appointment:', error);
    alertMessage = 'Failed to book appointment. Please try again.';
    alertType = 'error';
    showAlert = true;
    isSubmitting = false;
  }
};
