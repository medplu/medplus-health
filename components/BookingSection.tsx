// BookingSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import moment from 'moment';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../components/Shared/Colors';

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
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [patientName, setPatientName] = useState<string>('');
  const [showPatientNameInput, setShowPatientNameInput] = useState<boolean>(false);
  const [isPaymentRequired, setIsPaymentRequired] = useState<boolean>(true);
  const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    getDays();
    getTime();
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
    };

    console.log('Appointment Data:', appointmentData);

    const response = await axios.post('https://medplus-app.onrender.com/api/appointments', appointmentData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 201) {
      Alert.alert('Success', 'Appointment booked successfully.');
      resetBookingState();
    } else {
      console.error('Error Response:', response);
      Alert.alert('Error', 'Failed to book appointment.');
      setBookingInProgress(false);
    }
  } catch (error) {
    console.error('Error booking appointment:', error.response ? error.response.data : error.message);
    Alert.alert('Error', 'An error occurred while booking the appointment.');
    setBookingInProgress(false);
  }
};
  const resetBookingState = () => {
    setBookingInProgress(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setPatientName('');
    setShowPatientNameInput(false);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleDateSelect(item.date)}
            style={[styles.dateButton, selectedDate?.isSame(item.date, 'day') ? { backgroundColor: '#1f6f78' } : null]}
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
            <Text style={styles.bookButtonText}>{bookingInProgress ? 'Booking...' : 'Confirm Booking'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleShowPatientNameInput}
          disabled={bookingInProgress}
        >
          <Text style={styles.bookButtonText}>{bookingInProgress ? 'Booking...' : 'Book Appointment'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  timeSlotButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  bookButton: {
    backgroundColor: '#1f6f78',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default BookingSection;
