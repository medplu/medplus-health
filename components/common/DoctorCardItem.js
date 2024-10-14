import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack } from 'react-native-paystack-webview';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRouter } from 'expo-router';

const DoctorCardItem = ({ doctor }) => {
  const { firstName, lastName, category, availability, _id, consultationFee } = doctor;
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [appointmentId, setAppointmentId] = useState(null);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', userId: '' });

  const paystackWebViewRef = useRef();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Failed to fetch user ID from AsyncStorage', error);
      }
    };

    fetchUserId();
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

  const handleBookPress = async () => {
    setIsSubmitting(true);
    try {
      
      const appointmentResponse = await axios.post('https://medplus-app.onrender.com/api/appointments', {
        doctorId: _id,
        userId: user.userId,
        patientName: `${user.firstName} ${user.lastName}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      });

      const appointmentId = appointmentResponse.data._id;
      setAppointmentId(appointmentId);

      
      paystackWebViewRef.current.startTransaction();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
     
      console.log('Payment successful:', response);

      await axios.put(`https://medplus-app.onrender.com/api/appointments/confirm/${appointmentId}`, {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setAlertMessage('Payment was cancelled. Please try again.');
    setAlertType('error');
    setShowAlert(true);
    setIsSubmitting(false);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
       
        <Image
          source={{ uri: 'https://via.placeholder.com/120x150' }}
          style={{ width: 120, height: 150, objectFit: 'contain', borderRadius: 15 }}
        />

        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.headingContainer}>
              <MaterialIcons name="verified" size={20} color={Colors.primary} />
              <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
                Professional Doctor
              </Text>
            </View>

            <FontAwesome name="heart" size={20} color={Colors.primary} />
          </View>

         
          <View>
            <Text style={styles.doctorName}>
              Dr. {firstName} {lastName}
            </Text>
            <Text style={styles.categoryName}>
              {category}
            </Text>
            <Text style={[styles.categoryName, { color: Colors.primary }]}>
              {availability ? 'Available' : 'Not Available'}
            </Text>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Inter-Black-Semi' }}>⭐⭐⭐⭐ 4.8 </Text>
            <Text style={{ color: Colors.gray }}>49 Reviews</Text>
          </View>
        </View>
      </View>


      <TouchableOpacity style={styles.makeAppointmentContainer} onPress={handleBookPress} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
            Book Appointment
          </Text>
        )}
      </TouchableOpacity>

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={consultationFee * 100}
        billingEmail={user.email}
        currency='NGN'
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
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-Black-Bold'
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-Black',
    color: Colors.gray
  },
  makeAppointmentContainer: {
    backgroundColor: Colors.SECONDARY,
    padding: 10,
    borderRadius: 9,
    alignItems: 'center'
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 5
  },
  cardContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 12,
    gap: 10
  }
});

export default DoctorCardItem;