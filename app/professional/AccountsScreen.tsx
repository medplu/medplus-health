import { StyleSheet, Text, View, Alert, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../components/Shared/Colors';
import { selectUser } from '../../app/store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccountsScreen = () => {
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
  const [consultationFee, setConsultationFee] = useState<string>('');
  const [updatingFee, setUpdatingFee] = useState<boolean>(false);
  const [clinicData, setClinicData] = useState({
    name: '',
    contactInfo: '',
    address: '',
    image: '',
  });
  const [updatingClinic, setUpdatingClinic] = useState<boolean>(false);
  
  const user = useSelector(selectUser);
  const professionalId = user?.professional?._id;

  useEffect(() => {
    if (user) {
      setConsultationFee(user.consultationFee || '');
    }

    const checkPaymentSetupStatus = async () => {
      const status = await AsyncStorage.getItem('isPaymentSetupCompleted');
      if (status) {
        setIsPaymentSetupCompleted(true);
      }
    };

    checkPaymentSetupStatus();
    fetchBanks();
  }, [user]);

  useEffect(() => {
    if (user?.clinic) {
      setClinicData({
        name: user.clinic.name || '',
        contactInfo: user.clinic.contactInfo || '',
        address: user.clinic.address || '',
        image: user.clinic.image || '',
      });
    }
  }, [user]);

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

  const handlePaymentSetupComplete = async () => {
    await AsyncStorage.setItem('isPaymentSetupCompleted', 'true');
    setIsPaymentSetupCompleted(true);
    setShowPaymentSetupModal(false);
    Alert.alert('Payment Setup', 'Your payment setup is complete.');
  };

  const handleCreateSubaccount = async () => {
    try {
      if (!professionalId) {
        Alert.alert('Error', 'Professional ID not found. Please log in again.');
        return;
      }

      const subaccountPayload = {
        ...subaccountData,
        professionalId,
        percentage_charge: '10',
      };

      const response = await axios.post('https://medplus-health.onrender.com/api/payment/create-subaccount', subaccountPayload);
      Alert.alert('Subaccount Creation', 'Subaccount created successfully.');
      setShowSubaccountModal(false);
    } catch (error) {
      console.error('Error creating subaccount:', error.response ? error.response.data : error.message);
      Alert.alert('Subaccount Creation Failed', 'There was an error creating the subaccount.');
    }
  };

  const handleUpdateConsultationFee = async () => {
    setUpdatingFee(true);
    try {
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/professionals/update-consultation-fee/${professionalId}`,
        { consultationFee: parseFloat(consultationFee) },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Consultation fee updated successfully.');
    } catch (error) {
      console.error('Error updating consultation fee:', error);
      Alert.alert('Error', 'Failed to update consultation fee.');
    } finally {
      setUpdatingFee(false);
    }
  };

  const handleUpdateClinic = async () => {
    setUpdatingClinic(true);
    try {
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/clinics/update/${user.clinic._id}`,
        clinicData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Clinic information updated successfully.');
    } catch (error) {
      console.error('Error updating clinic information:', error);
      Alert.alert('Error', 'Failed to update clinic information.');
    } finally {
      setUpdatingClinic(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.details}>Update Clinic Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Clinic Name"
          value={clinicData.name}
          onChangeText={(text) => setClinicData({ ...clinicData, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact Info"
          value={clinicData.contactInfo}
          onChangeText={(text) => setClinicData({ ...clinicData, contactInfo: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={clinicData.address}
          onChangeText={(text) => setClinicData({ ...clinicData, address: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Image URL"
          value={clinicData.image}
          onChangeText={(text) => setClinicData({ ...clinicData, image: text })}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateClinic} disabled={updatingClinic}>
          <Text style={styles.buttonText}>{updatingClinic ? 'Updating...' : 'Update Clinic'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.details}>Update Consultation Fee</Text>
        <TextInput
          style={styles.input}
          placeholder="Consultation Fee"
          value={consultationFee}
          onChangeText={setConsultationFee}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateConsultationFee} disabled={updatingFee}>
          <Text style={styles.buttonText}>{updatingFee ? 'Updating...' : 'Update Fee'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.card, !isPaymentSetupCompleted && styles.disabledCard]}
        onPress={() => {
          if (isPaymentSetupCompleted) {
            setShowSubaccountModal(true);
          } else {
            setShowPaymentSetupModal(true);
          }
        }}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.details}>Update Payment</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showPaymentSetupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentSetupModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPaymentSetupModal(false)}>
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
                <TouchableOpacity style={styles.button} onPress={handlePaymentSetupComplete}>
                  <Text style={styles.buttonText}>Complete Setup</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showSubaccountModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSubaccountModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSubaccountModal(false)}>
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
    </View>
  );
};

export default AccountsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.ligh_gray,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
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
});