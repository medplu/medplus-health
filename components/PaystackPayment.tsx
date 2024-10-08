import React from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View } from 'react-native';

interface PaystackPaymentProps {
  paystackKey: string;
  amount: number;
  billingEmail: string;
  onCancel: () => void;
  onSuccess: () => void;
  autoStart?: boolean;
}

export default function PaystackPayment({
  paystackKey,
  amount,
  billingEmail,
  onCancel,
  onSuccess,
  autoStart = true
}: PaystackPaymentProps) {
  return (
    <View style={{ flex: 1 }}>
      <Paystack
        paystackKey={paystackKey} // Accept dynamic paystack key
        amount={amount} // Accept dynamic amount
        billingEmail={billingEmail} // Accept dynamic billing email
        activityIndicatorColor="green"
        onCancel={onCancel} // Accept dynamic cancel handler
        onSuccess={onSuccess} // Accept dynamic success handler
        autoStart={autoStart}
      />
    </View>
  );
}
