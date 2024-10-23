import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import useBooking from '../hooks/useBooking';
import useSchedule from '../hooks/useSchedule';
import Colors from './Shared/Colors';

type Day = {
  date: moment.Moment;
  formattedDate: string;
};

const BookingSection: React.FC<{ doctorId: string, userId: string, consultationFee: number }> = ({ doctorId, userId, consultationFee }) => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(moment());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [next7Days, setNext7Days] = useState<Day[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [showPatientNameInput, setShowPatientNameInput] = useState<boolean>(false);

  const { schedule, fetchSchedule } = useSchedule();
  const {
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
  } = useBooking(userId);

  useEffect(() => {
    console.log('doctorId:', doctorId);
    getDays();
    getUserData();
    fetchSchedule(doctorId);
  }, [doctorId]);

  const getDays = () => {
    const nextSevenDays: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      nextSevenDays.push({
        date: date,
        formattedDate: date.format('Do MMM'),
      });
    }
    setNext7Days(nextSevenDays);
  };

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      setUser({ firstName, lastName, email, userId });
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
    setSelectedTime(null);
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
    await handleBookPress(consultationFee);
  };

  const screenWidth = Dimensions.get('window').width;
  const filteredTimeSlots = schedule?.filter(slot => moment(slot.date).isSame(selectedDate, 'day')) || [];

  return (
    <View>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <FlatList
        data={next7Days}
        numColumns={7}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleDateSelect(item.date)}
            style={[styles.dateButton, selectedDate?.isSame(item.date, 'day') ? { backgroundColor: '#1f6f78' } : null, { width: screenWidth / 7 - 10 }]}
          >
            <Text style={styles.dayInitial}>{item.date.format('ddd').toUpperCase()}</Text>
            <Text style={styles.dateText}>{item.date.format('D')}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Pick a Time</Text>
      {filteredTimeSlots.length > 0 ? (
        <FlatList
          horizontal
          data={filteredTimeSlots}
          keyExtractor={(item) => item._id}
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
      ) : (
        <Text style={styles.noScheduleText}>
          No available time slots for the selected doctor. Please try another date or doctor.
        </Text>
      )}

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
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Book Appointment</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.showNameInputButton} onPress={handleShowPatientNameInput}>
          <Text style={styles.buttonText}>Proceed to Book</Text>
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
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={consultationFee}
        billingEmail={user.email}
        subaccount={subaccountCode}
        currency='KES'
        activityIndicatorColor={Colors.primary}
        ref={paystackWebViewRef}
        onCancel={handlePaymentCancel}
        onSuccess={(response) => handlePaymentSuccess(response, appointmentId!)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  dayInitial: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  timeSlotButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  timeSlotText: {
    fontSize: 14,
  },
  noScheduleText: {
    fontSize: 14,
    color: '#ff0000',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  bookButton: {
    backgroundColor: '#1f6f78',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  showNameInputButton: {
    backgroundColor: '#1f6f78',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BookingSection;  