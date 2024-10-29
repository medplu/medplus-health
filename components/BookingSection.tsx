import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack } from 'react-native-paystack-webview';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useBooking from '../hooks/useBooking';
import { Button, Input } from 'react-native-elements';
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
  const paystackWebViewRef = useRef(null);

  const {
    isSubmitting,
    alertMessage,
    alertType,
    appointmentId,
    subaccountCode,
    handleBookPress,
    handlePaymentSuccess,
    handlePaymentCancel,
  } = useBooking(userId);

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${doctorId}`);
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error.message);
    }
  };

  const getUserEmail = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email || '');
    } catch (error) {
      console.error('Failed to load user email', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
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

  const resetForm = () => {
    setSelectedDate(moment().format('YYYY-MM-DD'));
    setSelectedTimeSlot(null);
    setPatientName('');
    setShowPatientNameInput(false);
  };

  const handlePaymentSuccessWithReset = (response: any) => {
    handlePaymentSuccess(response, appointmentId);
    resetForm();
  };

  const groupedSlots = schedule.reduce((acc: Record<string, { date: string; _id: string; time: string }[]>, slot) => {
    const date = moment(slot.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        minDate={moment().startOf('week').format('YYYY-MM-DD')}
        maxDate={moment().endOf('week').format('YYYY-MM-DD')}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, marked: true, selectedColor: Colors.primary },
        }}
        theme={{
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.primary,
          arrowColor: Colors.primary,
        }}
      />
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
              selectedTimeSlot?.id === item._id ? { backgroundColor: Colors.primary } : null,
            ]}
          >
            <Text style={styles.timeSlotText}>{item.time}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.timeSlotList}
      />
      {showPatientNameInput ? (
        <View>
          <Text style={styles.sectionTitle}>Patient Name:</Text>
          <Input
            placeholder="Enter your name"
            value={patientName}
            onChangeText={setPatientName}
            containerStyle={styles.inputContainer}
            inputStyle={styles.input}
          />
          <Button
            title={isSubmitting ? <ActivityIndicator color="#fff" /> : 'Book Appointment'}
            onPress={handleBookAppointment}
            disabled={isSubmitting}
            buttonStyle={styles.bookButton}
          />
        </View>
      ) : (
        <Button
          title="Proceed to Book"
          onPress={handleShowPatientNameInput}
          buttonStyle={styles.showNameInputButton}
        />
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
        onSuccess={handlePaymentSuccessWithReset}
        ref={paystackWebViewRef}
      />
      <TouchableOpacity onPress={() => paystackWebViewRef.current && paystackWebViewRef.current.startTransaction()} style={styles.paymentButton}>
        <Text style={styles.buttonText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  dateTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.primary, textAlign: 'center' },
  timeSlotButton: { padding: 10, margin: 5, borderRadius: 5, borderWidth: 1, borderColor: Colors.primary },
  timeSlotText: { color: Colors.primary },
  bookButton: { backgroundColor: Colors.primary, marginTop: 10 },
  showNameInputButton: { backgroundColor: Colors.primary, marginTop: 20 },
  paymentButton: { backgroundColor: Colors.primary, padding: 15, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default BookingSection;
