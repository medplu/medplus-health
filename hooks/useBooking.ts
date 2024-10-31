import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store/configureStore'; // Adjust path according to your store file
import * as paystackProps from 'react-native-paystack-webview';

interface BookingHook {
  isSubmitting: boolean;
  showAlert: boolean;
  alertMessage: string;
  alertType: 'success' | 'error';
  appointmentId: string | null;
  subaccountCode: string | null;
  handleBookPress: (
    consultationFee: number,
    selectedTimeSlot: string,
    selectedDate: string
  ) => Promise<void>;
  handlePaymentSuccess: (appointmentId: string, response: any) => Promise<void>;
  handlePaymentCancel: () => void;
}

const useBooking = (userId: string): BookingHook => {
  const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [subaccountCode, setSubaccountCode] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    if (validateUserId(userId)) {
      fetchSubaccountCode(userId);
    } else {
      console.error('Invalid doctor ID format');
    }
  }, [userId]);

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
      console.log('Booking appointment with professionalId:', userId);

      if (!subaccountCode || !user.email) {
        throw new Error('Missing subaccount code or user email.');
      }

      const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
        email: user.email,
        amount: consultationFee * 100,
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

        const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
          doctorId: userId,
          userId: user.userId,
          patientName: `${user.firstName} ${user.lastName}`,
          date: selectedDate,
          time: selectedTimeSlot,
          status: 'pending',
        });

        const newAppointmentId = appointmentResponse.data.appointment._id;
        console.log('New Appointment ID:', newAppointmentId);

        if (!newAppointmentId) {
          throw new Error('Failed to retrieve appointmentId from response');
        }

        setAppointmentId(newAppointmentId);
        console.log('Created appointment with appointmentId:', newAppointmentId);

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

  const handlePaymentSuccess = async (appointmentId: string, response: any) => {
    setIsSubmitting(false);
    setAlertMessage('Payment successful and appointment confirmed!');
    setAlertType('success');
    setShowAlert(true);
    console.log('Payment successful:', response);

    try {
      await axios.patch(`https://medplus-health.onrender.com/api/appointments/${appointmentId}`, {
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setAlertMessage('Failed to update appointment status.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentCancel = () => {
    setIsSubmitting(false);
    setAlertMessage('Payment was canceled.');
    setAlertType('error');
    setShowAlert(true);
  };

  return {
    isSubmitting,
    showAlert,
    alertMessage,
    alertType,
    appointmentId,
    subaccountCode,
    handleBookPress,
    handlePaymentSuccess,
    handlePaymentCancel,
  };
};

export default useBooking;
