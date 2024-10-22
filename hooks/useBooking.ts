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
  handleBookPress: (consultationFee: number) => Promise<void>;
  handlePaymentSuccess: (response: any, appointmentId: string) => Promise<void>;
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
        const { subaccount_code } = response.data.data; // Destructure subaccount_code
        setSubaccountCode(subaccount_code); // Update state with the fetched subaccount code
        console.log('Fetched subaccount code:', subaccount_code);
      } else {
        console.error('Failed to fetch subaccount code:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch subaccount code:', error);
    }
  };

  const handleBookPress = async (consultationFee: number) => {
    setIsSubmitting(true);
    try {
      console.log('Booking appointment with professionalId:', professionalId, 'and userId:', user.userId);

      // Validate that subaccountCode and user.email are available
      if (!subaccountCode || !user.email) {
        throw new Error('Missing subaccount code or user email.');
      }

      // Initialize payment
      const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
        email: user.email,
        amount: consultationFee * 100, // Ensure this is the correct amount
        subaccount: subaccountCode, // Use the fetched subaccount code
        currency: 'KES', // Specifying the currency
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      // Check if payment initialization was successful
      if (paymentResponse.data.status) {
        console.log('Payment initialized:', paymentResponse.data);

        // Proceed with booking appointment after initializing payment
        const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
          doctorId: professionalId,
          userId: user.userId,
          patientName: `${user.firstName} ${user.lastName}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        const appointmentId = appointmentResponse.data._id;
        setAppointmentId(appointmentId);
        console.log('Created appointment with appointmentId:', appointmentId);

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

  const handlePaymentSuccess = async (response: any, appointmentId: string) => {
    try {
      console.log('Payment successful:', response);
      console.log('Confirming appointment with appointmentId:', appointmentId);

      await axios.put(`https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`, {
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