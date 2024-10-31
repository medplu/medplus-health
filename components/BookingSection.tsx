import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, PayStackRef } from 'react-native-paystack-webview';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import { Button } from 'react-native-elements';
import Colors from './Shared/Colors';

// Configure the calendar locale
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

const BookingSection: React.FC<{ doctorId: string; userId: string; consultationFee: number }> = ({
  doctorId,
  userId,
  consultationFee,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ id: string; time: string } | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [schedule, setSchedule] = useState<{ date: string; _id: string; time: string }[]>([]);
  const paystackWebViewRef = useRef<PayStackRef>(null);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Access userEmail and patientName from Redux
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

    await fetchSubaccountCode(userId); // Ensure subaccountCode is fetched before booking

    isSubmitting = true;
    try {
      console.log('Booking appointment with professionalId:', userId);

      // Check if subaccountCode and userEmail are valid
      if (!subaccountCode || !userEmail) {
        throw new Error('Missing subaccount code or user email.');
      }

      // Create appointment
      const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
        doctorId: userId,
        userId: userId,
        patientName: patientName,
        date: selectedDate,
        time: selectedTimeSlot.time,
        status: 'pending',
      });

      console.log('Appointment response:', appointmentResponse.data); // Log the entire response

      const newAppointmentId = appointmentResponse.data.appointment._id; // Extract the appointmentId from the response
      console.log('New Appointment ID:', newAppointmentId); // Log the ID

      if (!newAppointmentId) {
        throw new Error('Failed to retrieve appointmentId from response');
      setAppointmentId(newAppointmentId);
      appointmentId = newAppointmentId;
      console.log('Created appointment with appointmentId:', newAppointmentId);

      // Initialize Paystack payment
      const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
        email: userEmail,
        amount: consultationFee * 100,
        subaccount: subaccountCode,
        currency: 'KES',
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (paymentResponse.data.status) {
        console.log('Payment initialized:', paymentResponse.data);

        if (paystackWebViewRef.current) {
          paystackWebViewRef.current.startTransaction();
        } else {
          console.error('paystackWebViewRef.current is undefined');
        }
      } else {
        throw new Error('Payment initialization failed');
      }

      isSubmitting = false;
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      isSubmitting = false;
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    setIsSubmitting(false);
    setAlertMessage('Payment successful and appointment confirmed!');
    setAlertType('success');
    setShowAlert(true);
    console.log('Payment successful:', response);

      await axios.patch(`https://medplus-health.onrender.com/api/appointments/${appointmentId!}`, {
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

  const resetForm = () => {
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setSelectedTimeSlot(null);
  };

  const groupedSlots = schedule.reduce((acc: Record<string, { date: string; _id: string; time: string }[]>, slot) => {
    const date = moment(slot.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        minDate={moment().startOf('week').format('YYYY-MM-DD')}
        maxDate={moment().endOf('week').format('YYYY-MM-DD')}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, marked: true, selectedColor: Colors.primary },
        }}
        theme={{
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.primary,
          arrowColor: Colors.primary,
        }}
      />
      <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>
      <FlatList
        horizontal
        data={groupedSlots[selectedDate] || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTimeSlot({ id: item._id, time: item.time })}
            style={[
              styles.timeSlotButton,
              selectedTimeSlot?.id === item._id ? { backgroundColor: Colors.primary } : null,
            ]}
          >
            <Text style={styles.timeSlotText}>{item.time}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.timeSlotList}
      />
      {selectedTimeSlot && (
        <TouchableOpacity
          onPress={handleBookPress}
          style={styles.paymentButton}
        >
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      )}
      <AwesomeAlert
        show={showAlert}
        showProgress={true}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor="#DD6B55"
        onConfirmPressed={() => setShowAlert(false)}
      />
      <Paystack
        paystackKey={process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}
        billingEmail={userEmail}
        amount={consultationFee}
        currency='KES'
        onCancel={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        ref={paystackWebViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  dateTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  timeSlotButton: { padding: 10, margin: 5, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary },
  timeSlotText: { color: Colors.primary },
  paymentButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default BookingSection;