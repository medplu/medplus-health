import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, ScrollView, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons'; // Import the eye icon
import Colors from '../../components/Shared/Colors';
import HorizontalLine from '../../components/common/HorizontalLine';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';

const TransactionScreen: React.FC = () => {
  const PAYSTACK_SECRET_KEY = process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY;
  const [isPaymentSetupCompleted, setIsPaymentSetupCompleted] = useState<boolean>(false);
  const [showPaymentSetupModal, setShowPaymentSetupModal] = useState<boolean>(false);
  const [showSubaccountModal, setShowSubaccountModal] = useState<boolean>(false);
  const [subaccountData, setSubaccountData] = useState({
    business_name: '',
    settlement_bank: '',
    account_number: '',
    subaccount_code: '',
  });
  const [banks, setBanks] = useState<{ name: string, code: string }[]>([]);
  const [isAccountInfoVisible, setIsAccountInfoVisible] = useState<boolean>(false); // Add state for toggling visibility
  const [transactions, setTransactions] = useState<any[]>([]); // Add state for transactions
  const user = useSelector(selectUser);

  useEffect(() => {
    console.log('useEffect triggered'); // Debug log to check if useEffect is firing
    const checkPaymentSetupStatus = async () => {
      const status = await AsyncStorage.getItem('isPaymentSetupCompleted');
      if (!status) {
        setShowPaymentSetupModal(true);
      } else {
        setIsPaymentSetupCompleted(true);
      }
    };

    checkPaymentSetupStatus();
    fetchBanks();
    fetchSubaccountInfo();
    fetchTransactions(); // Fetch transactions
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await axios.get('https://api.paystack.co/bank?country=kenya', {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
      const fetchedBanks = response.data.data;
      setBanks(fetchedBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      Alert.alert('Error', 'Failed to fetch banks.');
    }
  };

  const fetchSubaccountInfo = async () => {
    try {
      const userId = user.userId
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${userId}`);
      setSubaccountData(response.data);
    } catch (error) {
      console.error('Error fetching subaccount info:', error);
      Alert.alert('Error', 'Failed to fetch subaccount info.');
    }
  };

  const fetchTransactions = async () => {
    console.log('fetchTransactions called'); // Debug log
    try {
      const reference = await AsyncStorage.getItem('transactionReference');
      console.log(reference)
      if (!reference) {
        Alert.alert('Error', 'Transaction reference not found. Please try again.');
        return;
      }
  
      const response = await axios.get(`https://api.paystack.co/transaction/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      });
      console.log('Transactions fetched:', response.data); // Debug log
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to fetch transactions.');
    }
  };

  const handlePaymentSetupComplete = async () => {
    await AsyncStorage.setItem('isPaymentSetupCompleted', 'true');
    setIsPaymentSetupCompleted(true);
    setShowPaymentSetupModal(false);
    Alert.alert('Payment Setup', 'Your payment setup is complete.');
  };

  const handleCreateSubaccount = async () => {
    try {
      const userId = user.userId;
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      const { business_name, settlement_bank, account_number } = subaccountData;
      if (!business_name || !settlement_bank || !account_number) {
        Alert.alert('Error', 'All fields are required.');
        return;
      }

      const subaccountPayload = {
        business_name,
        settlement_bank,
        account_number,
        userId,
        percentage_charge: '10', // Set default percentage charge
      };

      const response = await axios.post('https://medplus-health.onrender.com/api/payment/create-subaccount', subaccountPayload);
      Alert.alert('Subaccount Creation', 'Subaccount created successfully.');
      setShowSubaccountModal(false);
    } catch (error) {
      console.error('Error creating subaccount:', error.response ? error.response.data : error.message);
      Alert.alert('Subaccount Creation Failed', 'There was an error creating the subaccount.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Account Info Section */}
        <View style={styles.section}>
          <View style={styles.infoHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <TouchableOpacity onPress={() => setIsAccountInfoVisible(!isAccountInfoVisible)}>
              <Ionicons 
                name={isAccountInfoVisible ? "eye-off" : "eye"} 
                size={24} 
                color={Colors.SECONDARY} 
              />
            </TouchableOpacity>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Name: {isAccountInfoVisible ? subaccountData.business_name : '******'}
            </Text>
            <Text style={styles.infoText}>
              Account Number: {isAccountInfoVisible ? subaccountData.account_number : '******'}
            </Text>
            <Text style={styles.infoText}>
              Bank: {isAccountInfoVisible ? subaccountData.settlement_bank : '******'}
            </Text>
          </View>
        </View>

        {/* Example Button to create a subaccount (will be enabled after payment setup) */}
        <TouchableOpacity
          style={[styles.card, !isPaymentSetupCompleted && styles.disabledCard]}
          onPress={() => {
            if (isPaymentSetupCompleted) {
              setShowSubaccountModal(true);
            } else {
              Alert.alert('Payment Setup Required', 'Please complete your payment setup first.');
            }
          }}
          disabled={!isPaymentSetupCompleted}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.details}>Update Payment</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <HorizontalLine />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {transactions.map((transaction, index) => (
          <View key={index} style={styles.transactionCard}>
            <Text style={styles.transactionText}>{transaction.description}</Text>
            <Text style={styles.transactionText}>Amount: {transaction.amount}</Text>
            <Text style={styles.transactionDate}>Date: {new Date(transaction.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </View>

      {/* Payment Setup Prompt Modal */}
      <Modal
        visible={showPaymentSetupModal || showSubaccountModal} // Combine modal visibility
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPaymentSetupModal(false);
          setShowSubaccountModal(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowPaymentSetupModal(false);
          setShowSubaccountModal(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <MaterialIcons name="payment" size={40} color="#6200ee" />
                <Text style={styles.modalTitle}>Set Payment</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  value={subaccountData.business_name}
                  onChangeText={(text) => setSubaccountData({ ...subaccountData, business_name: text })}
                />
                <Picker
                  selectedValue={subaccountData.settlement_bank}
                  style={styles.input}
                  onValueChange={(itemValue) => setSubaccountData({ ...subaccountData, settlement_bank: itemValue })}
                >
                  {banks.map((bank, index) => (
                    <Picker.Item key={`${bank.code}-${index}`} label={bank.name} value={bank.code} />
                  ))}
                </Picker>
                <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  value={subaccountData.account_number}
                  onChangeText={(text) => setSubaccountData({ ...subaccountData, account_number: text })}
                />
                <TouchableOpacity style={styles.button} onPress={handleCreateSubaccount}>
                  <Text style={styles.buttonText}>Confirm Updates</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.ligh_gray,
  },
  button: {
    backgroundColor: 'rgba(111, 202, 186, 1)',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  disabledCard: {
    backgroundColor: '#f0f0f0',
  },
  iconContainer: {
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  transactionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  transactionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default TransactionScreen;