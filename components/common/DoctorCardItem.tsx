import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';
import { Paystack } from 'react-native-paystack-webview';
import AwesomeAlert from 'react-native-awesome-alerts';
import useBooking from '../../hooks/useBooking';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  availability: boolean;
  user: string;
  profileImage?: string; // Add profileImage to the Doctor interface
}

interface DoctorCardItemProps {
  doctor: Doctor;
  userId: string; // Professional's ID
  consultationFee: number;
}

const DoctorCardItem: React.FC<DoctorCardItemProps> = ({ doctor, userId, consultationFee }) => {
  const { firstName, lastName, category, availability, _id, profileImage } = doctor;
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
  } = useBooking(userId); // Pass professional ID to the hook

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ 
            uri: profileImage ? profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' 
          }} 
          style={styles.profileImage}
        />
        <View style={styles.headerText}>
          <Text style={styles.doctorName}>Dr. {firstName} {lastName}</Text>
          <Text style={styles.categoryName}>{category}</Text>
          <Text style={[styles.categoryName, { color: Colors.primary }]}>
            {availability ? 'Available' : 'Not Available'}
          </Text>
        </View>
        <FontAwesome name="heart" size={20} color={Colors.primary} />
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐⭐⭐⭐ 4.8 </Text>
        <Text style={styles.reviewText}>49 Reviews</Text>
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={() => handleBookPress(consultationFee)} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        )}
      </TouchableOpacity>

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={consultationFee}
        billingEmail={user.email}
        subaccount={subaccountCode} // Add this line
        currency='KES'
        activityIndicatorColor={Colors.primary}
        onCancel={handlePaymentCancel}
        onSuccess={(response) => handlePaymentSuccess(response, appointmentId!)}
        ref={paystackWebViewRef}
      />

      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={Colors.primary}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-Black-Semi',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingText: {
    fontFamily: 'Inter-Black-Semi',
  },
  reviewText: {
    color: Colors.gray,
  },
  bookButton: {
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: Colors.primary,
    fontFamily: 'Inter-Black-Semi',
    fontSize: 15,
  },
});

export default DoctorCardItem;