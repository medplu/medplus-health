import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import SubHeading from '../dashboard/SubHeading';
import moment from 'moment';
import GlobalApi from '../../Services/GlobalApi';
import Colors from '../Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import AwesomeAlert from 'react-native-awesome-alerts'; // Import AwesomeAlert
import PaystackPayment from '../../components/PaystackPayment'

const BookingSection = ({ clinic }) => {
  const [next7Days, setNext7Days] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeList, setTimeList] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '' }); // Initialize user state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  useEffect(() => {
    getDays();
    getTime();
    getUserData(); // Fetch user data from AsyncStorage
  }, []);

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email'); // Assuming email is also stored

      setUser({ firstName, lastName, email });
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const getDays = () => {
    const today = moment();
    const nextSevenDays = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      nextSevenDays.push({
        date: date,
        day: date.format('ddd'), // Mon Tue
        formattedDate: date.format('Do MMM') // 1 Jan
      });
    }
    setNext7Days(nextSevenDays);
  };

  const getTime = () => {
    const timeList = [];
    for (let i = 7; i <= 11; i++) {
      timeList.push({
        time: i + ":00 AM"
      });
      timeList.push({
        time: i + ":30 AM"
      });
    }

    for (let i = 1; i <= 5; i++) {
      timeList.push({
        time: i + ":00 PM"
      });
      timeList.push({
        time: i + ":30 PM"
      });
    }
    setTimeList(timeList);
  };

  const handleBookAppointment = () => {
    // Perform validation
    console.log('Selected Date:', selectedDate);
    console.log('Selected Time:', selectedTime);
    console.log('Clinic ID:', clinic._id);
    console.log('Notes:', notes);
  
    if (!selectedDate || !selectedTime || !clinic._id || !notes) {
      setAlertMessage('Please fill in all the required fields.');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
  
    // Show payment modal
    setIsPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (response) => {
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
        PaymentInfo: response, // Include payment information
      }
    };

    console.log('This Booked Appointment Data is sent to Strapi --> ', data);
    GlobalApi.createAppointement(data)
      .then(() => {
        console.log('🟢 Booked Data sent Successfully');
        setAlertMessage('Your appointment has been successfully booked.');
        setAlertType('success');
        setShowAlert(true);

        // Reset the form fields
        setSelectedDate(next7Days[0]?.date);
        setSelectedTime(null);
        setNotes('');
      })
      .catch(error => {
        console.log('🔴Error while sending data to backend = ', error);
        setAlertMessage('There was an error booking your appointment. Please try again.');
        setAlertType('error');
        setShowAlert(true);
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsPaymentModalVisible(false);
      });
  };

  const handlePaymentError = (error) => {
    setAlertMessage(error);
    setAlertType('error');
    setShowAlert(true);
    setIsPaymentModalVisible(false);
  };

  return (
    <View>
      <Text style={{ fontSize: 18, color: Colors.gray, marginBottom: 10 }}>Book Appointment</Text>

      <SubHeading subHeadingTitle={'Day'} seeAll={false} />

      {/* Date */}
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDate(item.date)}
            style={[styles.dayButton, selectedDate == item.date ? { backgroundColor: Colors.primary } : null]}
          >
            <Text style={[{ fontFamily: 'Inter-Black' }, selectedDate == item.date ? { color: Colors.white } : null]}>
              {item.day}
            </Text>
            <Text style={[{ fontFamily: 'Inter-Black-Semi' }, selectedDate == item.date ? { color: Colors.white } : null]}>
              {item.formattedDate}
            </Text>
          </TouchableOpacity>
        )}
      />

      <SubHeading subHeadingTitle={'Time'} seeAll={false} />

      {/* Time */}
      <FlatList
        horizontal
        data={timeList}
        keyExtractor={(item) => item.time}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTime(item.time)}
            style={[styles.dayButton, { paddingVertical: 16 }, selectedTime == item.time ? { backgroundColor: Colors.primary } : null]}
          >
            <Text style={[{ fontFamily: 'Inter-Black-Semi' }, selectedTime == item.time ? { color: Colors.white } : null]}>
              {item.time}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 15 }}
      />

      <SubHeading subHeadingTitle={'Note'} seeAll={false} />

      {/* Notes */}
      <TextInput
        onChangeText={(val) => setNotes(val)}
        numberOfLines={3}
        placeholder='Write Note Here'
        value={notes} // Bind the value to the state
        style={{ backgroundColor: Colors.ligh_gray, padding: 10, borderRadius: 10, borderColor: Colors.secondary, borderWidth: 1 }}
      />

      {/* Make Appointment Button */}
      <TouchableOpacity
        onPress={handleBookAppointment}
        disabled={isSubmitting}
        style={{ backgroundColor: Colors.primary, borderRadius: 99, padding: 13, margin: 10, left: 0, right: 0, marginBottom: 10, zIndex: 20 }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={{ fontSize: 20, textAlign: 'center', color: Colors.white, fontFamily: 'Inter-Black-Semi', fontSize: 17 }}>
            Make Appointment
          </Text>
        )}
      </TouchableOpacity>

      {/* Paystack Payment Modal */}
      {isPaymentModalVisible && (
        <PaystackPayment
          isVisible={isPaymentModalVisible}
          onClose={() => setIsPaymentModalVisible(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {/* Awesome Alert */}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={alertType === 'success' ? Colors.primary : Colors.red}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    borderWidth: 1,
    borderRadius: 99,
    padding: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginRight: 10,
    borderColor: Colors.gray
  }
});

export default BookingSection;