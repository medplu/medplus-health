import React, { useEffect, useState } from 'react';
import { View, Button, Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack } from 'react-native-paystack-webview';
import Toast from 'react-native-toast-message';

const PaystackPayment = ({ amount, onSuccess, onError }) => {
  const [userEmail, setUserEmail] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        if (email) {
          setUserEmail(email);
        }
      } catch (error) {
        console.error('Failed to load user email', error);
      }
    };

    fetchUserEmail();
  }, []);

  const handlePayment = () => {
    Toast.show({
      type: 'info',
      text1: 'Starting payment process...',
    });
    setShowPaystack(true);
  };

  return (
    <View>
      <Button title="Pay with Paystack" onPress={handlePayment} />
      {showPaystack && (Platform.OS === 'android' || Platform.OS === 'ios') ? (
        <Paystack
          paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0" // Replace with your public key
          amount={amount * 100} // Multiply amount by 100 to convert to the smallest currency unit
          billingEmail={userEmail}
          activityIndicatorColor="green"
          onCancel={() => {
            setShowPaystack(false);
            onError('Payment window closed');
            Toast.show({
              type: 'error',
              text1: 'Payment canceled!',
            });
          }}
          onSuccess={(response) => {
            setShowPaystack(false);
            onSuccess(response);
            Toast.show({
              type: 'success',
              text1: 'Payment successful!',
            });
          }}
          autoStart={true}
        />
      ) : (
        showPaystack && (
          <Text>Paystack payment is not supported on this platform.</Text>
        )
      )}
    </View>
  );
};

export default PaystackPayment;