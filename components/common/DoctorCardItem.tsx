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
    <View style={styles.cardContainer}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Image
          source={{ 
            uri: profileImage ? profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' 
          }} 
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

      <TouchableOpacity style={styles.makeAppointmentContainer} onPress={() => handleBookPress(consultationFee)} disabled={isSubmitting}>
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
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-Black-Semi'
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular'
  },
  cardContainer: {
    margin: 10,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: '#FFF',
    padding: 10
  },
  makeAppointmentContainer: {
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  }
});

export default DoctorCardItem;