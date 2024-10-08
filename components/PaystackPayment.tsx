
import React from 'react';
import  { Paystack }  from 'react-native-paystack-webview';
import { View } from 'react-native';

export default function PaystackPayment() {
  return (
    <View style={{ flex: 1 }}>
      <Paystack  
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={25000.00}        
        billingEmail="medpluscollaborate@gmail.com"
        activityIndicatorColor="green"
        onCancel={(e) => {
          // handle response here
        }}
        onSuccess={(res) => {
          // handle response here
        }}
        autoStart={true}
      />
    </View>
  );
}