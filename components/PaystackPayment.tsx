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
            paystackKey="pk_test_e8c64d3af2e18ee1b4e63b82d920a9b2b5041fdf"
            billingEmail="greggambugua@gmail.com"
            billingName="Munga"          
            amount={25000}           
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
