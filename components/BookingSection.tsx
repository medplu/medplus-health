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
  const [schedule, setSchedule] = useState<{ date: string; startTime: string; endTime: string; isBooked: boolean; _id: string }[]>([]);
  const [appointmentId, setAppointmentId] = useState<string | null>(null); // Track appointment ID
  const paystackWebViewRef = useRef<PayStackRef>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Add isSubmitting state

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

    try {
      if (!subaccountCode || !userEmail) {
        throw new Error('Missing subaccount code or user email.');
      }

      // Create appointment
      const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
        doctorId: doctorId, // Ensure correct doctorId
        userId: userId,
        patientName: patientName,
        date: selectedDate,
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
        `https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`, // Ensure this URL matches backend route
        {}, // Send an empty body if not required
        {
          headers: {
            'Content-Type': 'application/json',
            // Add any required authentication headers here
          },
        }
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
    setSelectedDate(moment().format('YYYY-MM-DD'));
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
            onPress={() => {
              if (!item.isBooked) {
                setSelectedTimeSlot({ id: item._id, time: `${item.startTime} - ${item.endTime}` });
              } else {
                Alert.alert('Slot Unavailable', 'This time slot is already booked.');
              }
            }}
            style={[
              styles.timeSlotButton,
              selectedTimeSlot?.id === item._id ? { backgroundColor: Colors.primary } : null,
            ]}
          >
            <Text style={styles.timeSlotText}>{`${item.startTime} - ${item.endTime}`}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity onPress={handleBookPress} style={styles.bookButton} disabled={isSubmitting}>
        <Text style={styles.bookButtonText}>{isSubmitting ? 'Booking...' : 'Book Appointment'}</Text>
      </TouchableOpacity>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        onDismiss={() => setShowAlert(false)}
        contentContainerStyle={{ backgroundColor: alertType === 'success' ? Colors.success : Colors.error }}
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
    padding: 16,
    backgroundColor: '#fff',
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  timeSlotButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    color: '#000',
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BookingSection;
