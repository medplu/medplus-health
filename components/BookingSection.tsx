import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack } from 'react-native-paystack-webview';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useBooking from '../hooks/useBooking';
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
  const [patientName, setPatientName] = useState<string>('');
  const [showPatientNameInput, setShowPatientNameInput] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<{ date: string; _id: string; time: string }[]>([]);

  const {
    isSubmitting,
    alertMessage,
    alertType,
    appointmentId,
    subaccountCode,
    paystackWebViewRef,
    handleBookPress,
    handlePaymentSuccess,
    handlePaymentCancel,
  } = useBooking(userId);

  const fetchSchedule = async (doctorId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${doctorId}`);
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching schedule:', error.message);
      } else {
        console.error('Error fetching schedule:', error);
      }
    }
  };

  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) {
        setUserEmail(email);
      } else {
        // Fallback to getUser function if email is not found in AsyncStorage
        const user = await getUser();
        setUserEmail(user.email);
      }
    } catch (error) {
      console.error('Failed to load user email', error);
    }
  };

  useEffect(() => {
    fetchSchedule(doctorId);
    getUserEmail();
  }, [doctorId]);

  const handleShowPatientNameInput = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot.');
      return;
    }
    setShowPatientNameInput(true);
  };

  const handleBookAppointment = async () => {
    if (!patientName) {
      Alert.alert('Error', "Please enter the patient's name.");
      return;
    }
    await handleBookPress(consultationFee, selectedTimeSlot?.id || '', selectedDate);
  };

  const groupedSlots = schedule.reduce((acc: Record<string, { date: string; _id: string; time: string }[]>, slot) => {
    const date = moment(slot.date).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        current={selectedDate}
        minDate={moment().startOf('week').format('YYYY-MM-DD')}
        maxDate={moment().endOf('week').format('YYYY-MM-DD')}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, marked: true, selectedColor: '#1f6f78' },
        }}
        theme={{
          selectedDayBackgroundColor: '#1f6f78',
          todayTextColor: '#1f6f78',
          arrowColor: '#1f6f78',
        }}
      />

      <View>
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
                selectedTimeSlot?.id === item._id ? { backgroundColor: '#1f6f78' } : null,
              ]}
            >
              <Text style={styles.timeSlotText}>{item.time}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 15 }}
        />
      </View>

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
        billingEmail={userEmail}
        subaccount={subaccountCode}
        currency='KES'
        activityIndicatorColor={Colors.primary}
        onCancel={handlePaymentCancel}
        onSuccess={(response) => handlePaymentSuccess(response, appointmentId!)}
        ref={paystackWebViewRef}
      />

      <TouchableOpacity onPress={() => paystackWebViewRef.current && paystackWebViewRef.current.startTransaction()}>
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const getUser = async () => {
  // Mock function to simulate fetching user details
  return {
    email: 'user@example.com',
  };
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
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