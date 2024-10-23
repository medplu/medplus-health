import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack } from 'react-native-paystack-webview';
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
  const [patientEmail, setPatientEmail] = useState<string>(''); // New email state
  const [gender, setGender] = useState<string>(''); // New gender state
  const [showPatientInfoInput, setShowPatientInfoInput] = useState<boolean>(false);

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
      const email = await AsyncStorage.getItem('email');
      setPatientEmail(email || ''); // Set email from AsyncStorage
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleShowPatientInfoInput = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time.');
      return;
    }
    setShowPatientInfoInput(true);
  };

  const handleBookAppointment = async () => {
    if (!patientName || !patientEmail || !gender) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    const formattedDate = selectedDate?.format('YYYY-MM-DD');
    
    const bookingDetails = {
      doctorId,
      userId,
      patientName,
      patientEmail,
      gender,
      isNew: true,
      date: formattedDate,
      time: selectedTime,
      medicalRecords: [],
    };
  
    await handleBookPress(bookingDetails);
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

      {showPatientInfoInput ? (
        <View>
          <Text style={styles.sectionTitle}>Patient Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter patient's name"
            value={patientName}
            onChangeText={setPatientName}
          />
          <Text style={styles.sectionTitle}>Patient Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter patient's email"
            value={patientEmail}
            onChangeText={setPatientEmail}
          />
          <Text style={styles.sectionTitle}>Gender:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity onPress={() => setGender('Male')} style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}>
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('Female')} style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('Other')} style={[styles.genderButton, gender === 'Other' && styles.selectedGender]}>
              <Text style={styles.genderText}>Other</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookAppointment}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Book Appointment</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.showNameInputButton} onPress={handleShowPatientInfoInput}>
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
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  genderButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedGender: {
    backgroundColor: '#1f6f78',
  },
  genderText: {
    fontSize: 14,
  },
  bookButton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#1f6f78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  showNameInputButton: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#1f6f78',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});

export default BookingSection;
