import React, { useState } from 'react';
import { Paystack } from 'react-native-paystack-webview';
import { View, TouchableOpacity, Text, Modal, StyleSheet } from 'react-native';

export default function PaystackPayment() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Text style={styles.buttonText}>Pay Now</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Paystack
            paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
            billingEmail="paystackwebview@something.com"
            amount={'25000.00'}
            currency='NGN'
            onCancel={(e) => {
              console.log('Payment Cancelled:', e);
              setModalVisible(false);
            }}
            onSuccess={(res) => {
              console.log('Payment Successful:', res);
              setModalVisible(false);
            }}
            autoStart={true}  // Automatically opens the WebView on modal open
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
});
