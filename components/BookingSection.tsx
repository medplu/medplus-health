import React, { useState, useEffect, useRef } from 'react';

import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, PayStackRef } from 'react-native-paystack-webview';
import axios from 'axios';
import Colors from './Shared/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUserProfile } from '../app/store/userSlice';

const BookingSection: React.FC<{ doctorId: string; consultationFee: number }> = ({
  doctorId,
  consultationFee,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ id: string; time: string } | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [schedule, setSchedule] = useState<{ date: string; startTime: string; endTime: string; isBooked: boolean; _id: string }[]>([]);
  const [appointmentId, setAppointmentId] = useState<string | null>(null); // Track appointment ID
  const paystackWebViewRef = useRef<PayStackRef>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Add isSubmitting state

 // Access user state from Redux
 const user = useSelector(selectUser);
 const { name, email, profileImage, userId } = user; // Extract userId from Redux state
 const professionalId = user?.professional?._id
  const userEmail = useSelector((state) => state.user.email);
  const patientName = useSelector((state) => state.user.name); // Assuming name is stored in Redux

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${doctorId}`);
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error.message);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [doctorId]);

  const handleBookPress = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot.');
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true);
    setShowAlert(false);
    setAlertMessage('');
    setAlertType('success');
    let subaccountCode: string | null = null;

    const fetchSubaccountCode = async (userId: string) => {
      try {
        const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${professionalId}`);
        if (response.data.status === 'Success') {
          const { subaccount_code } = response.data.data;
          subaccountCode = subaccount_code;
        } else {
          console.error('Failed to fetch subaccount code:', response.data.message);
        }
      } catch (error) {
        console.error('Failed to fetch subaccount code:', error);
      }
    };

    await fetchSubaccountCode(professionalId); // Ensure subaccountCode is fetched before booking

    try {
      if (!subaccountCode || !userEmail) {
        throw new Error('Missing subaccount code or user email.');
      }

      // Create appointment
      const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
        doctorId: doctorId, // Ensure correct doctorId
        userId: userId,
        patientName: patientName,
        date: moment(selectedDate).format('YYYY-MM-DD'),
        timeSlotId: selectedTimeSlot.id, // Include slot ID
        time: selectedTimeSlot.time,     // Include slot time
        status: 'pending',
      });

      const newAppointmentId = appointmentResponse.data.appointment._id;
      if (!newAppointmentId) {
        throw new Error('Failed to retrieve appointmentId from response');
      }
      console.log('New appointment ID:', newAppointmentId); // Log newAppointmentId
      setAppointmentId(newAppointmentId); // Set appointmentId for later use

      // Initialize Paystack payment
      const paymentResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: userEmail,
          amount: consultationFee * 100, // Convert to smallest currency unit
          subaccount: subaccountCode,
          currency: 'KES',
          metadata: {
            appointmentId: newAppointmentId, // Include appointmentId in metadata
            timeSlotId: selectedTimeSlot.id,  // Include timeSlotId in metadata
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (paymentResponse.data.status) {
        if (paystackWebViewRef.current) {
          paystackWebViewRef.current.startTransaction();
        }
      } else {
        throw new Error('Payment initialization failed');
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    setIsSubmitting(false);
    setAlertMessage('Payment successful and appointment confirmed!');
    setAlertType('success');
    setShowAlert(true);
    console.log('Payment successful:', response);

    try {
      if (!appointmentId) {
        throw new Error('No appointment ID available for status update.');
      }
      console.log('Confirming appointment with ID:', appointmentId); // Log appointmentId

      const confirmResponse = await axios.patch(
        `https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`,
        { status: 'confirmed' }
      );
      console.log('Confirm response:', confirmResponse.data); // Log confirmation response

      // Optionally, refetch the schedule to update booked slots
      fetchSchedule();
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

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedTimeSlot(null);
  };

  const groupedSlots = schedule.reduce((acc: Record<string, { date: string; startTime: string; endTime: string; isBooked: boolean; _id: string }[]>, slot) => {
    const date = moment(slot.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  const dateOptions = Array.from({ length: 7 }).map((_, i) => moment().add(i, 'days').toDate());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>
      <FlatList
        horizontal
        data={dateOptions}
        keyExtractor={(item) => item.toISOString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDate(item)}
            style={[
              styles.dateButton,
              selectedDate.toDateString() === item.toDateString() ? { backgroundColor: Colors.goofy } : null,
            ]}
          >
            <Text style={styles.dateText}>{moment(item).format('ddd, DD')}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>
      <FlatList
        horizontal
        data={groupedSlots[moment(selectedDate).format('YYYY-MM-DD')] || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (!item.isBooked) {
                setSelectedTimeSlot({ id: item._id, time: `${item.startTime} - ${item.endTime}` });
              } else {
                Alert.alert('Slot already booked', 'Please choose another time slot.');
              }
            }}
            style={[
              styles.slotButton,
              item.isBooked ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.LIGHT_GRAY },
              selectedTimeSlot && selectedTimeSlot.id === item._id ? { borderColor: Colors.primary, borderWidth: 2 } : {},
            ]}
          >
            <Text style={styles.slotText}>
              {item.isBooked ? 'Booked' : `${item.startTime} - ${item.endTime}`}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.bookButton} onPress={handleBookPress} disabled={isSubmitting}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>

      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        onConfirmPressed={() => {
          setShowAlert(false);
          if (alertType === 'success') resetForm();
        }}
      />

<Paystack
      paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
      billingEmail={userEmail}
      amount={consultationFee} // Ensure amount is in smallest currency unit
      currency='KES'
      onCancel={handlePaymentCancel}
      onSuccess={handlePaymentSuccess}
      ref={paystackWebViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dateText: {
    color: Colors.primary,
  },
  dateTitle: {
    fontSize: 18,
    marginVertical: 20,
  },
  slotButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  slotText: {
    color: Colors.SECONDARY,
  },
  bookButton: {
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: Colors.SECONDARY,
    fontSize: 18,
  },
});

export default BookingSection;
