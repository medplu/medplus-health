import { StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  day: string;
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
  const [isPaymentRequired, setIsPaymentRequired] = useState<boolean>(true); // To track if payment is required
const [paymentInProgress, setPaymentInProgress] = useState<boolean>(false); // To track payment progress
const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false); // To track if the payment is successful


  useEffect(() => {
    fetchDoctorDetails();
    getTime();
    getDays();
  }, [doctorId]);

  const getDays = () => {
    const nextSevenDays: Day[] = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      nextSevenDays.push({
        date: date,
        day: '', // Remove day initials
        formattedDate: date.format('Do MMM') // 1 Jan
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

  const monthYear = next7Days.length > 0 ? moment(next7Days[0].date).format('MMMM YYYY') : '';

  const fetchDoctorDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/professionals/${doctorId}`);
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

    setBookingInProgress(true); // Start booking process

    try {
      const token = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'User not authenticated.');
        setBookingInProgress(false); // Reset booking process
        return;
      }

      const appointmentData = {
        doctorId,
        userId,
        patientName,
        date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
        time: selectedTime,
      };

      const response = await axios.post('http://localhost:3000/api/appointments', appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Appointment booked successfully.');
        setBookingInProgress(false); // Reset booking process
        setSelectedDate(null); // Reset selected date
        setSelectedTime(null); // Reset selected time
        setPatientName(''); // Reset patient name
        setShowPatientNameInput(false); // Hide patient name input
      } else {
        Alert.alert('Error', 'Failed to book appointment.');
        setBookingInProgress(false); // Reset booking process
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'An error occurred while booking the appointment.');
      setBookingInProgress(false); // Reset booking process
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  const handlePayment = async () => {
    if (!patientName) {
      Alert.alert('Error', 'Please enter the patient\'s name.');
      return;
    }
  
    setPaymentInProgress(true);
  
    try {
      // Mock payment request to an API or payment gateway
      const paymentResponse = await axios.post('http://localhost:3000/api/payment/', {
        amount: 50, // Example amount to charge for the appointment
        userId: await AsyncStorage.getItem('userId'),
        doctorId: doctorId,
        patientName: patientName,
      });
  
      if (paymentResponse.status === 200) {
        Alert.alert('Payment Success', 'Payment was successful!');
        setPaymentSuccess(true); // Mark the payment as successful
      } else {
        Alert.alert('Payment Failed', 'Payment could not be processed. Please try again.');
        setPaymentSuccess(false); // Mark the payment as failed
      }
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Error', 'An error occurred during the payment process.');
    } finally {
      setPaymentInProgress(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <Image
        source={{ uri: doctor?.image?.url || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' }}
        style={styles.profileImage}
      />
      <Text style={styles.doctorName}>{`${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`}</Text>
      <Text style={styles.doctorEmail}>{doctor?.email ?? ''}</Text>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <Text style={styles.sectTitle}>{monthYear}</Text>
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleDateSelect(item.date)}
            style={[
              styles.dateButton,
              selectedDate?.isSame(item.date, 'day') ? { backgroundColor: '#1f6f78' } : null,
              item.date.isSame(moment(), 'day') ? { borderColor: '#93e4c1', borderWidth: 2 } : null // Highlight today's date
            ]}
          >
            <Text style={[styles.dayInitial, selectedDate?.isSame(item.date, 'day') ? { color: 'black' } : null]}>
              {item.date.format('ddd').toUpperCase()}
            </Text>
            <Text style={[styles.dateText, selectedDate?.isSame(item.date, 'day') ? { color: 'black' } : null]}>
              {item.date.format('D')}
            </Text>
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
            <Text style={[styles.timeSlotText, selectedTime === item.time ? { color: '#fff' } : null]}>
              {item.time}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
      />
      {showPatientNameInput ? (
  <>
    <Text style={styles.sectionTitle}>Patient Name:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter your name"
      value={patientName}
      onChangeText={setPatientName}
    />
    
    {/* Payment button shown after patient name is entered */}
    <TouchableOpacity
      style={[styles.paymentButton, paymentInProgress ? { opacity: 0.5 } : null]}
      onPress={paymentInProgress ? () => {} : handlePayment}
      disabled={paymentInProgress}
    >
      <Text style={styles.paymentButtonText}>{paymentInProgress ? 'Processing Payment...' : 'Proceed to Payment'}</Text>
    </TouchableOpacity>

    {/* Show confirmation only if payment is successful */}
    {paymentSuccess && (
      <TouchableOpacity
        style={[styles.bookButton, bookingInProgress ? { opacity: 0.5 } : null]}
        onPress={bookingInProgress ? () => {} : handleBookAppointment}
        disabled={bookingInProgress}
      >
        <Text style={styles.bookButtonText}>{bookingInProgress ? 'Booking...' : 'Confirm Booking'}</Text>
      </TouchableOpacity>
    )}
  </>
) : (
  <TouchableOpacity
    style={[styles.bookButton, bookingInProgress ? { opacity: 0.5 } : null]}
    onPress={bookingInProgress ? () => {} : handleShowPatientNameInput}
    disabled={bookingInProgress}
  >
    <Text style={styles.bookButtonText}>{bookingInProgress ? 'Booking...' : 'Book Appointment'}</Text>
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
    // Add styles for timeSlotText if needed
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
  sectTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10, // Adjust as needed
    textAlign: 'center',
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
  dayInitial: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2, // Adjust as needed
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
});

export default DoctorProfile;