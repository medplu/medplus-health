import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalApi from '../../Services/GlobalApi';

type RouteParams = {
  doctorId: string;
};

type Doctor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: { url: string };
};

type Day = {
  date: moment.Moment;
  formattedDate: string;
};

type TimeSlot = {
  time: string;
};

const DoctorProfile = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();

  const { doctorId } = route.params;
  const [loading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(moment());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [next7Days, setNext7Days] = useState<Day[]>([]);
  const [timeList, setTimeList] = useState<TimeSlot[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [patientName, setPatientName] = useState<string>('');
  const [showPatientNameInput, setShowPatientNameInput] = useState<boolean>(false);
  const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchDoctorDetails();
    getDays();
    getTime();
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

  const getTime = () => {
    const timeList: TimeSlot[] = [];
    for (let i = 7; i <= 11; i++) {
      timeList.push({ time: i + ':00 AM' });
      timeList.push({ time: i + ':30 AM' });
    }
    for (let i = 1; i <= 5; i++) {
      timeList.push({ time: i + ':00 PM' });
      timeList.push({ time: i + ':30 PM' });
    }
    setTimeList(timeList);
  };

  const fetchDoctorDetails = async () => {
    try {
      const response = await GlobalApi.getDoctorById(doctorId);
      setDoctor(response.data);
    } catch (err) {
      setError('Error fetching doctor details');
    } finally {
      setIsLoading(false);
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
      };

      const response = await axios.post('https://medplus-app.onrender.com/api/appointments', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Appointment booked successfully.');
        setBookingInProgress(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setPatientName('');
        setShowPatientNameInput(false);
      } else {
        Alert.alert('Error', 'Failed to book appointment.');
        setBookingInProgress(false);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'An error occurred while booking the appointment.');
      setBookingInProgress(false);
    }
  };

  const handlePayment = async () => {
    if (!patientName) {
      Alert.alert('Error', 'Please enter the patient\'s name.');
      return;
    }

    setPaymentInProgress(true);

    try {
      const paymentResponse = await axios.post('https://medplus-app.onrender.com/api/payment/', {
        amount: 50, // Example amount to charge for the appointment
        userId: await AsyncStorage.getItem('userId'),
        doctorId: doctorId,
        patientName: patientName,
      });

      if (paymentResponse.status === 200) {
        Alert.alert('Payment Success', 'Payment was successful!');
        setPaymentSuccess(true);
      } else {
        Alert.alert('Payment Failed', 'Payment could not be processed. Please try again.');
        setPaymentSuccess(false);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'An error occurred during the payment process.');
    } finally {
      setPaymentInProgress(false);
    }
  };

  const renderDateButton = (item: Day) => (
    <TouchableOpacity
      onPress={() => handleDateSelect(item.date)}
      style={[styles.dateButton, selectedDate?.isSame(item.date) && styles.selectedDateButton]}
      accessible={true}
      accessibilityLabel={`Select date ${item.formattedDate}`}
    >
      <Text style={styles.dateButtonText}>{item.formattedDate}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <Image
        source={{ uri: doctor?.image?.url || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' }}
        style={styles.profileImage}
      />
      <Text style={styles.doctorName}>{`${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`}</Text>
      <Text style={styles.doctorEmail}>{doctor?.email ?? ''}</Text>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => renderDateButton(item)}
      />
      <Text style={styles.sectionTitle}>Pick a Time</Text>
      <FlatList
        horizontal
        data={timeList}
        keyExtractor={(item) => item.time}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTime(item.time)}
            style={[styles.timeSlotButton, selectedTime === item.time && { backgroundColor: '#1f6f78' }]}
            accessible={true}
            accessibilityLabel={`Select time ${item.time}`}
          >
            <Text style={[styles.timeSlotText, selectedTime === item.time && { color: '#fff' }]}>
              {item.time}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <TouchableOpacity onPress={handleShowPatientNameInput} style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
      {showPatientNameInput && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter patient's name"
            value={patientName}
            onChangeText={setPatientName}
          />
          <TouchableOpacity onPress={handleBookAppointment} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      )}
      {paymentInProgress && <ActivityIndicator size="small" color="#0000ff" />}
      {paymentSuccess && (
        <TouchableOpacity onPress={handlePayment} style={styles.paymentButton}>
          <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#93e4c1',
    padding: 20, // Add padding to avoid edge-cutting
  },
  backButton: {
    position: 'absolute',
    top: 40, // Adjust as needed
    left: 20, // Adjust as needed
    zIndex: 1, // Ensure the button is on top
  },
  paymentButton: {
    padding: 15,
    backgroundColor: '#ff7f50',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10, // Adjusted for spacing
    width: '100%', // Make the button take full width
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: '40%', // Use percentage for responsiveness
    height: undefined, // Auto adjust height to keep the ratio
    aspectRatio: 1, // Ensure image remains square
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20,
  },
  timeSlotText: {
    color: '#333',
    fontSize: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  doctorEmail: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  timeSlotButton: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100, // Adjust the width as needed
    height: 40, // Adjust the height as needed
  },
  bookButton: {
    padding: 15,
    backgroundColor: '#1f6f78',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20, // Adjusted for spacing
    width: '100%', // Make the button take full width
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5, // Adjust as needed
  },
  dateButton: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100, // Adjust the width as needed
    height: 40, // Adjust the height as needed
  },
  dateButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#1f6f78',
  },
  confirmButton: {
    padding: 15,
    backgroundColor: '#1f6f78',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10, // Adjusted for spacing
    width: '100%', // Make the button take full width
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DoctorProfile;