import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack, PaystackRef } from 'react-native-paystack-webview';
import AwesomeAlert from 'react-native-awesome-alerts';

type Day = {
  date: moment.Moment;
  day: string;
  formattedDate: string;
};

type TimeSlot = {
  time: string;
};

type BookingSectionProps = {
  doctorId: string;
};

const BookingSection: React.FC<BookingSectionProps> = ({ doctorId }) => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(moment());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [next7Days, setNext7Days] = useState<Day[]>([]);
  const [timeList, setTimeList] = useState<TimeSlot[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>('');
  const [showPatientNameInput, setShowPatientNameInput] = useState<boolean>(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', userId: '' });

  const paystackWebViewRef = useRef<PaystackRef>(null);

  useEffect(() => {
    getDays();
    getTime();
    getUserData();
  }, []);

  const getDays = () => {
    const nextSevenDays: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      nextSevenDays.push({
        date: date,
        day: '',
        formattedDate: date.format('Do MMM'),
      });
    }
    setNext7Days(nextSevenDays);
  };

  const getTime = () => {
    const timeList: TimeSlot[] = [];
    for (let i = 7; i <= 11; i++) {
      timeList.push({ time: i + ":00 AM" });
      timeList.push({ time: i + ":30 AM" });
    }
    for (let i = 1; i <= 5; i++) {
      timeList.push({ time: i + ":00 PM" });
      timeList.push({ time: i + ":30 PM" });
    }
    setTimeList(timeList);
  };

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      setUser({ firstName, lastName, email, userId });
      console.log('Fetched user data:', { firstName, lastName, email, userId });
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
  };

  const handleShowPatientNameInput = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time.');
      return;
    }
    setShowPatientNameInput(true);
  };

  const handleBookAppointment = async () => {
    if (!patientName) {
      Alert.alert('Error', 'Please enter the patient\'s name.');
      return;
    }

    setBookingInProgress(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'User not authenticated.');
        setBookingInProgress(false);
        return;
      }

      const appointmentData = {
        doctorId,
        userId,
        patientName,
        date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
        time: selectedTime,
        status: 'pending'
      };

      console.log('Appointment Data:', appointmentData);

      const response = await axios.post('https://medplus-app.onrender.com/api/appointments', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        const appointmentId = response.data._id;
        setAppointmentId(appointmentId);
        console.log('Created appointment with appointmentId:', appointmentId);

        // Ensure Paystack is triggered immediately after setting the appointmentId
        if (paystackWebViewRef.current) {
          console.log('Paystack transaction initiated');
          paystackWebViewRef.current.startTransaction();
        } else {
          console.error('Paystack WebView reference is undefined');
          Alert.alert('Error', 'Failed to initiate payment. Please try again.');
          setBookingInProgress(false);
        }
      } else {
        console.error('Error Response:', response);
        Alert.alert('Error', 'Failed to book appointment.');
        setBookingInProgress(false);
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred while booking the appointment.');
      setBookingInProgress(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    try {
      console.log('Payment successful:', response);
      console.log('Confirming appointment with appointmentId:', appointmentId);

      await axios.put(`https://medplus-app.onrender.com/api/appointments/confirm/${appointmentId}`, {
        status: 'confirmed'
      });

      Alert.alert('Success', 'Appointment booked and payment successful!');
      resetBookingState();
    } catch (error: any) {
      console.error('Failed to update appointment status:', error);
      Alert.alert('Error', 'Payment successful, but failed to update appointment status. Please contact support.');
      setBookingInProgress(false);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    Alert.alert('Error', 'Payment was cancelled. Please try again.');
    setBookingInProgress(false);
  };

  const resetBookingState = () => {
    setBookingInProgress(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setPatientName('');
    setShowPatientNameInput(false);
    setAppointmentId(null);
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <FlatList
        data={next7Days}
        numColumns={7}
        key={'fixed-columns'} // Static key to avoid dynamic column change error
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleDateSelect(item.date)}
            style={[
              styles.dateButton,
              selectedDate?.isSame(item.date, 'day') ? { backgroundColor: '#1f6f78' } : null,
              { width: screenWidth / 7 - 10 },
            ]}
          >
            <Text style={styles.dayInitial}>{item.date.format('ddd').toUpperCase()}</Text>
            <Text style={styles.dateText}>{item.date.format('D')}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Pick a Time</Text>
      <FlatList
        horizontal
        data={timeList}
        keyExtractor={(item) => item.time}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTime(item.time)}
            style={[styles.timeSlotButton, selectedTime === item.time ? { backgroundColor: '#1f6f78' } : null]}
          >
            <Text style={styles.timeSlotText}>{item.time}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
      />

      {showPatientNameInput ? (
        <View>
          <Text style={styles.sectionTitle}>Patient Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={patientName}
            onChangeText={setPatientName}
          />

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
            disabled={bookingInProgress}
          >
            {bookingInProgress ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleShowPatientNameInput}
          disabled={bookingInProgress}
        >
          {bookingInProgress ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          )}
        </TouchableOpacity>
      )}

      {appointmentId && (
        <Paystack
          paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
          amount={'25000.00'}
          billingEmail={user.email}
          currency='KES'
          activityIndicatorColor="#1f6f78"
          onCancel={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          ref={paystackWebViewRef}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#1f6f78',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 5,
    height: 60,
  },
  dayInitial: {
    fontSize: 12,
    color: 'black',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  timeSlotButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#1f6f78',
    alignItems: 'center',
    padding: 5,
    marginHorizontal: 5,
  },
  timeSlotText: {
    color: 'black',
  },
  bookButton: {
    backgroundColor: '#1f6f78',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1f6f78',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default BookingSection;