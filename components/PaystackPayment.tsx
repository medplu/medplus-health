import React from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';

interface PaystackPaymentProps {
  amount: number;
  billingEmail: string;
  onSuccess: (res: any) => void;
  onError: (e: any) => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({ amount, billingEmail, onSuccess, onError }) => {
  return (
    <View style={{ flex: 1 }}>
      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={amount}
        billingEmail={billingEmail}
        onCancel={(e) => onError(e)}
        onSuccess={(res) => onSuccess(res)}
        currency='KES'
        activityIndicatorColor="green"
        autoStart={true}
      />
    </View>
  );
};

export default PaystackPayment;