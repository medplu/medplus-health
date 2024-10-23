import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList, TextInput, ActivityIndicator, StyleSheet, Dimensions, Platform } from 'react-native';
import moment, { Moment } from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import * as DocumentPicker from 'expo-document-picker';
import useBooking from '../hooks/useBooking';
import useSchedule from '../hooks/useSchedule';
import Colors from './Shared/Colors';

type Day = {
  date: Moment;
  formattedDate: string;
};

interface BookingSectionProps {
  doctorId: string;
  userId: string;
  consultationFee: number;
}

const BookingSection: React.FC<BookingSectionProps> = ({ doctorId, userId, consultationFee }) => {
  const [selectedDate, setSelectedDate] = useState<Moment | null>(moment());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [next7Days, setNext7Days] = useState<Day[]>([]);
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [gender, setGender] = useState<string>('male');
  const [isNew, setIsNew] = useState<boolean>(true);
  const [medicalRecords, setMedicalRecords] = useState<string[]>([]);
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
      setPatientEmail(email || '');
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const handleDateSelect = (date: Moment) => {
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
    if (!patientName || !patientEmail || !gender) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    await handleBookPress({
      doctorId,
      userId,
      patientName,
      patientEmail,
      gender,
      isNew,
      date: selectedDate?.format('YYYY-MM-DD'),
      time: selectedTime,
      medicalRecords,
      consultationFee,
    });
  };

  const handleUploadMedicalRecord = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setMedicalRecords([...medicalRecords, result.uri]);
      }
    } catch (error) {
      console.error('Error uploading medical record:', error);
    }
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
          <Text style={styles.sectionTitle}>Patient Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={patientEmail}
            onChangeText={setPatientEmail}
          />
          <Text style={styles.sectionTitle}>Gender:</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'male' ? styles.genderButtonSelected : null]}
              onPress={() => setGender('male')}
            >
              <Text style={styles.genderButtonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'female' ? styles.genderButtonSelected : null]}
              onPress={() => setGender('female')}
            >
              <Text style={styles.genderButtonText}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'other' ? styles.genderButtonSelected : null]}
              onPress={() => setGender('other')}
            >
              <Text style={styles.genderButtonText}>Other</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Upload Medical Records:</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadMedicalRecord}>
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
          {medicalRecords.map((record, index) => (
            <Text key={index} style={styles.recordText}>{record.split('/').pop()}</Text>
          ))}

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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: '#1f6f78',
  },
  genderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#1f6f78',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recordText: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
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