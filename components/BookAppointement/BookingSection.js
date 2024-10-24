import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import SubHeading from '../dashboard/SubHeading';
import axios from 'axios';
import Colors from '../Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack } from 'react-native-paystack-webview';
import { FontAwesome } from '@expo/vector-icons';
import { useSchedule } from '../../context/ScheduleContext';
import moment from 'moment';

const BookingSection = ({ clinic, navigation }) => {
  const { schedule } = useSchedule();
  const [next7Days, setNext7Days] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', userId: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [appointmentId, setAppointmentId] = useState(null);

  const paystackWebViewRef = useRef();

  useEffect(() => {
    getDays();
    getUserData();
  }, []);

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

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !clinic._id || !notes) {
      setAlertMessage('Please fill in all the required fields.');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    try {
      const appointmentResponse = await axios.post('https://medplus-app.onrender.com/api/clinic/appointments', {
        userId: user.userId,
        clinicId: clinic._id,
        date: selectedDate,
        time: selectedTime,
        notes,
        status: 'pending'
      });

      const appointmentId = appointmentResponse.data._id;
      setAppointmentId(appointmentId);

      paystackWebViewRef.current.startTransaction({
        onSuccess: (response) => handlePaymentSuccess(response, appointmentId),
        onCancel: handlePaymentCancel
      });
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      await axios.put(`https://medplus-health.onrender.com/api/clinic/appointments/${appointmentId}`, {
        status: 'confirmed'
      });

      setAlertMessage('Appointment booked and payment successful!');
      setAlertType('success');
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      setAlertMessage('Payment successful, but failed to update appointment status. Please contact support.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentCancel = () => {
    setAlertMessage('Payment was cancelled. Please try again.');
    setAlertType('error');
    setShowAlert(true);
  };

  const filteredTimeSlots = schedule
    .filter(slot => moment(slot.date).format('YYYY-MM-DD') === selectedDate)
    .flatMap(slot => slot.slots);

  return (
    <View>
      <Text style={{ fontSize: 18, color: Colors.gray, marginBottom: 10 }}>Book Appointment</Text>
      <SubHeading subHeadingTitle="Day" seeAll={false} />
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {next7Days.map((day) => (
          <TouchableOpacity
            key={day.date}
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
      </ScrollView>
      <SubHeading subHeadingTitle="Time" seeAll={false} />
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {filteredTimeSlots.length > 0 ? (
          filteredTimeSlots.map((slot, index) => (
            <TouchableOpacity
              key={`${selectedDate}-${slot.time}-${index}`} // Ensure unique key
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
          ))
        ) : (
          <Text style={{ color: Colors.primary, marginLeft: 10 }}>No available time slots for this date.</Text>
        )}
      </ScrollView>
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

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={'25000.00'}
        billingEmail={user.email}
        currency='KES'
        activityIndicatorColor={Colors.primary}
        onCancel={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        ref={paystackWebViewRef}
      />

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
    color: Colors.black,
  },
});

export default BookingSection;
