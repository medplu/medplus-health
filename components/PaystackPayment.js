import React, { useEffect, useState } from 'react';
import { View, Button, ToastAndroid } from 'react-native'; // Import necessary components from react-native
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack } from 'react-native-paystack-webview'; // Import Paystack from react-native-paystack-webview

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
    setShowPaystack(true);
  };

  return (
    <View>
      <Button title="Pay with Paystack" onPress={handlePayment} />
      {showPaystack && (
        <Paystack
          paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0" // Your public key
          amount={amount * 100} // Multiply amount by 100 to convert to the smallest currency unit
          billingEmail={userEmail}
          activityIndicatorColor="green"
          onCancel={() => {
            // Handle if the user closes the payment window
            setShowPaystack(false);
            onError('Payment window closed');
          }}
          onSuccess={(response) => {
            // Handle successful payment here
            setShowPaystack(false);
            onSuccess(response);
            ToastAndroid.show('Payment successful!', ToastAndroid.SHORT); // Show success message
          }}
          autoStart={true}
        />
      )}
    </View>
  );
};

export default PaystackPayment;