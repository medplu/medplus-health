import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import SubHeading from '../dashboard/SubHeading';
import axios from 'axios';
import Colors from '../Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { WebView } from 'react-native-webview';

const BookingSection = ({ clinic }) => {
  const [next7Days, setNext7Days] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeList, setTimeList] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    getDays();
    getTime();
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      setUser({ firstName, lastName, email });
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const getDays = () => {
    const today = new Date();
    const nextSevenDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      nextSevenDays.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleString('en-us', { weekday: 'short' }),
        formattedDate: date.toLocaleDateString('en-us', { day: 'numeric', month: 'short' }),
      });
    }
    setNext7Days(nextSevenDays);
  };

  const getTime = () => {
    const timeList = [];
    for (let i = 7; i <= 11; i++) {
      timeList.push({ time: `${i}:00 AM` });
      timeList.push({ time: `${i}:30 AM` });
    }
    for (let i = 1; i <= 5; i++) {
      timeList.push({ time: `${i}:00 PM` });
      timeList.push({ time: `${i}:30 PM` });
    }
    setTimeList(timeList);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !clinic._id || !notes) {
        setAlertMessage('Please fill in all the required fields.');
        setAlertType('error');
        setShowAlert(true);
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/payment/start-payment', {
            amount: 25000,
            email: user.email,
            full_name: `${user.firstName} ${user.lastName}`,
        });

        const authorizationUrl = response.data.data.data.authorization_url; // Correct access
        setPaymentUrl(authorizationUrl); // Set the payment URL to render WebView
    } catch (error) {
        console.error('Failed to initiate payment:', error);
        setAlertMessage('Failed to initiate payment. Please try again.');
        setAlertType('error');
        setShowAlert(true);
    }
};


  const handlePaymentSuccess = async (reference) => {
    try {
      const response = await axios.post('http://localhost:3000/api/payment/create-payment', { reference });

      if (response.data.status === 'success') {
        const fullName = `${user.firstName} ${user.lastName}`;
        setIsSubmitting(true);
        const data = {
          data: {
            UserName: fullName,
            Email: user.email,
            Date: selectedDate,
            Time: selectedTime,
            clinic: clinic.id,
            Note: notes,
            PaymentInfo: response.data,
          },
        };

        await axios.post('http://localhost:3000/api/appointments', data);
        setAlertMessage('Your appointment has been successfully booked.');
        setAlertType('success');
        setShowAlert(true);
        setSelectedDate(next7Days[0]?.date);
        setSelectedTime(null);
        setNotes('');
      } else {
        console.error('Payment verification failed:', response.data);
        setAlertMessage('Payment verification failed. Please try again.');
        setAlertType('error');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setAlertMessage('There was an error booking your appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setAlertMessage('Payment failed. Please try again.');
    setAlertType('error');
    setShowAlert(true);
  };

  return (
    <View>
      <Text style={{ fontSize: 18, color: Colors.gray, marginBottom: 10 }}>Book Appointment</Text>
      <SubHeading subHeadingTitle="Day" seeAll={false} />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {next7Days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDate === day.date && styles.selectedButton,
            ]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text style={selectedDate === day.date ? styles.selectedText : styles.text}>
              {day.day} {day.formattedDate}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <SubHeading subHeadingTitle="Time" seeAll={false} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {timeList.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeButton,
              selectedTime === slot.time && styles.selectedButton,
            ]}
            onPress={() => setSelectedTime(slot.time)}
          >
            <Text style={selectedTime === slot.time ? styles.selectedText : styles.text}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Enter additional notes (optional)"
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity
        onPress={handleBookAppointment}
        disabled={isSubmitting}
        style={{ backgroundColor: Colors.primary, borderRadius: 99, padding: 13, margin: 10 }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={{ fontSize: 17, textAlign: 'center', color: Colors.white }}>
            Make Appointment
          </Text>
        )}
      </TouchableOpacity>
      {paymentUrl ? (
        <WebView
    source={{ uri: paymentUrl }}
    startInLoadingState={true}
    renderLoading={() => <ActivityIndicator size="large" color={Colors.primary} />}
    onNavigationStateChange={(navState) => {
        const currentUrl = navState.url;
        console.log('Current URL:', currentUrl); // Log current URL for debugging
        if (currentUrl.includes('reference=')) {
            const reference = currentUrl.split('reference=')[1];
            handlePaymentSuccess(reference); // Call success handler
        }
    }}
    onError={(error) => handlePaymentError(error)}
/>
      ) : null}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={Colors.primary}
        onConfirmPressed={() => {
          setShowAlert(false);
          if (alertType === 'success') {
            
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    margin: 5,
  },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: Colors.white,
  },
  text: {
    color: Colors.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
});

export default BookingSection;