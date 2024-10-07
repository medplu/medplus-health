import React, { useEffect, useState } from 'react';
import { View, Button, Platform, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack } from 'react-native-paystack-webview';

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
    if (Platform.OS === 'android') {
      ToastAndroid.show('Starting payment process...', ToastAndroid.SHORT);
    } else {
      console.log('Starting payment process...');
    }
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
            if (Platform.OS === 'android') {
              ToastAndroid.show('Payment canceled!', ToastAndroid.SHORT);
            } else {
              console.log('Payment canceled!');
            }
          }}
          onSuccess={(response) => {
            setShowPaystack(false);
            onSuccess(response);
            if (Platform.OS === 'android') {
              ToastAndroid.show('Payment successful!', ToastAndroid.SHORT);
            } else {
              console.log('Payment successful!');
            }
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