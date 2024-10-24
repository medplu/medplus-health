import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import { Alert } from 'react-native';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
}

interface BookingHook {
  isSubmitting: boolean;
  showAlert: boolean;
  alertMessage: string;
  alertType: 'success' | 'error';
  appointmentId: string | null;
  user: User;
  subaccountCode: string | null;
  paystackWebViewRef: React.RefObject<paystackProps.PayStackRef>;
  handleBookPress: (consultationFee: number, selectedTimeSlot: string, selectedDate: string) => Promise<void>;
  handlePaymentSuccess: (response: any) => Promise<void>;
  handlePaymentCancel: () => void;
}

const useBooking = (professionalId: string): BookingHook => {
  const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', email: '', userId: '' });
  const [subaccountCode, setSubaccountCode] = useState<string | null>(null);

  useEffect(() => {
    getUserData();
    fetchSubaccountCode(professionalId);
  }, [professionalId]);

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      if (firstName && lastName && email && userId) {
        setUser({ firstName, lastName, email, userId });
        console.log('Fetched user data:', { firstName, lastName, email, userId });
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const fetchSubaccountCode = async (professionalId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${professionalId}`);
      if (response.data.status === 'Success') {
        const { subaccount_code } = response.data.data; 
        setSubaccountCode(subaccount_code); 
        console.log('Fetched subaccount code:', subaccount_code);
      } else {
        console.error('Failed to fetch subaccount code:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch subaccount code:', error);
    }
  };
  const handleBookPress = async (consultationFee: number, selectedTimeSlot: string, selectedDate: string) => {
    setIsSubmitting(true);
    try {
      console.log('Booking appointment with professionalId:', professionalId, 'and userId:', user.userId);
  
      if (!subaccountCode || !user.email) {
        throw new Error('Missing subaccount code or user email.');
      }
  
      // Initialize payment with Paystack
      const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
        email: user.email,
        amount: consultationFee * 100, // Convert to kobo
        subaccount: subaccountCode, 
        currency: 'KES', 
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (paymentResponse.data.status) {
        console.log('Payment initialized:', paymentResponse.data);
  
        // Proceed with booking appointment after initializing payment
        const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
          doctorId: professionalId,
          userId: user.userId,
          patientName: `${user.firstName} ${user.lastName}`,
          date: selectedDate,
          time: selectedTimeSlot,
          status: 'pending', // Set initial status to pending
        });
  
        console.log('Appointment response:', appointmentResponse.data);
  
        const newAppointmentId = appointmentResponse.data.appointment._id; // Access the nested appointment object
        if (!newAppointmentId) {
          throw new Error('Failed to retrieve appointmentId from response');
        }
        setAppointmentId(newAppointmentId);
        console.log('Created appointment with appointmentId:', newAppointmentId);
  
        // Start the Paystack transaction
        if (paystackWebViewRef.current) {
          paystackWebViewRef.current.startTransaction();
        } else {
          console.error('paystackWebViewRef.current is undefined');
        }
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };
  const handlePaymentSuccess = async (response: any) => {
    const currentAppointmentId = appointmentId; // Capture the appointmentId from state
    if (!currentAppointmentId) {
      console.error('No appointmentId found in state');
      setAlertMessage('Payment successful, but failed to update appointment status. Please contact support.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Payment successful:', response);
      console.log('Confirming appointment with appointmentId:', currentAppointmentId);

      // Confirm the appointment after successful payment
      await axios.put(`https://medplus-health.onrender.com/api/appointments/confirm/${currentAppointmentId}`, {
        status: 'confirmed'
      });

      setAlertMessage('Appointment booked and payment successful!');
      setAlertType('success');
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      setAlertMessage('Payment successful, but failed to update appointment status. Please contact support.');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setAlertMessage('Payment was cancelled. Please try again.');
    setAlertType('error');
    setShowAlert(true);
    setIsSubmitting(false);
  };

  return {
    isSubmitting,
    showAlert,
    alertMessage,
    alertType,
    appointmentId,
    user,
    subaccountCode,
    paystackWebViewRef,
    handleBookPress,
    handlePaymentSuccess,
    handlePaymentCancel,
  };
};

export default useBooking;