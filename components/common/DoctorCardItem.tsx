import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Card, Avatar, Button, Icon, Divider } from 'react-native-elements';
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
  profileImage?: string;
}

interface DoctorCardItemProps {
  doctor: Doctor;
  userId: string;
  consultationFee: number;
}

const DoctorCardItem: React.FC<DoctorCardItemProps> = ({ doctor, userId, consultationFee }) => {
  const { firstName, lastName, category, availability, profileImage } = doctor;
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

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <Avatar
          rounded
          size="medium"
          source={{ uri: profileImage ? profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
        />
        <View style={styles.headerText}>
          <Text style={styles.doctorName}>{firstName} {lastName}</Text>
          <Text style={styles.categoryName}>{category}</Text>
          <Text style={[styles.categoryName, { color: availability ? Colors.success : Colors.error }]}>
            {availability ? 'Available' : 'Not Available'}
          </Text>
        </View>
        <Icon name="heart" type="font-awesome" color={Colors.primary} />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐⭐⭐⭐ 4.8</Text>
        <Text style={styles.reviewText}>49 Reviews</Text>
      </View>

      <Button
        title={isSubmitting ? <ActivityIndicator color="#FFF" /> : 'Book Appointment'}
        onPress={() => handleBookPress(consultationFee)}
        disabled={isSubmitting}
        buttonStyle={styles.bookButton}
      />

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={consultationFee}
        billingEmail={user.email}
        subaccount={subaccountCode}
        currency="KES"
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
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={Colors.primary}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: Colors.ligh_gray,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    color: Colors.gray,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  ratingText: {
    fontWeight: 'bold',
  },
  reviewText: {
    color: Colors.gray,
  },
  divider: {
    backgroundColor: Colors.lightGray,
    marginVertical: 10,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
});

export default DoctorCardItem;
