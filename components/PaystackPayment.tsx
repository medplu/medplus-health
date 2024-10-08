import React, { useRef } from 'react';
import  { Paystack , paystackProps}  from 'react-native-paystack-webview';
import { View, TouchableOpacity,Text } from 'react-native';

export default function Pay(){
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(); 

  return (
    <View style={{flex: 1}}>
      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        billingEmail="medpluscollaborate@gmail.com"
        billingName='miku'
    
        amount={'25000.00'}
        onCancel={(e) => {
          // handle response here
        }}
        onSuccess={(res) => {
          // handle response here
        }}
        ref={paystackWebViewRef as any}
      />

        <TouchableOpacity onPress={()=> paystackWebViewRef.current?.startTransaction()}>
          <Text>Pay Now</Text>
        </TouchableOpacity>
      </View>
  );
}