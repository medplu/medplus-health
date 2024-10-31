import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, PayStackRef } from 'react-native-paystack-webview';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
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
  const [appointmentId, setAppointmentId] = useState<string | null>(null); // Track appointment ID
  const paystackWebViewRef = useRef<PayStackRef>(null);

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
    let subaccountCode: string | null = null;

    const fetchSubaccountCode = async (userId: string) => {
      try {
        const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${userId}`);
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

    await fetchSubaccountCode(userId); // Ensure subaccountCode is fetched before booking

    isSubmitting = true;
    try {
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

      const newAppointmentId = appointmentResponse.data.appointment._id;
      if (!newAppointmentId) {
        throw new Error('Failed to retrieve appointmentId from response');
      }
      setAppointmentId(newAppointmentId); // Set appointmentId for later use

      // Initialize Paystack payment
      const paymentResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: userEmail,
          amount: consultationFee * 100,
          subaccount: subaccountCode,
          currency: 'KES',
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

    try {
      if (!appointmentId) {
        throw new Error('No appointment ID available for status update.');
      }
      await axios.patch(`https://medplus-health.onrender.com/api/appointments/confirms${appointmentId}`, {
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
        <TouchableOpacity onPress={handleBookPress} style={styles.paymentButton}>
          <Text style={styles.buttonText}>Book Appointment</Text>
        </TouchableOpacity>
      )}
      <AwesomeAlert
        show={showAlert}
        showProgress={true}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside
        onDismiss={() => setShowAlert(false)}
      />
      <Paystack
      paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
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

export default BookingSection;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  dateTitle: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  timeSlotList: { paddingVertical: 10 },
  timeSlotButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  timeSlotText: { color: Colors.textPrimary },
  paymentButton: {
    marginVertical: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
