import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface FormState {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  available: boolean;
  consultationFee: string;
}

const SettingsScreen: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    available: false,
    consultationFee: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        setUserId(id);
        fetchInitialState(id);
      } else {
        Alert.alert('Error', 'User ID not found');
      }
    };

    const fetchInitialState = async (id: string) => {
      try {
        const storedAvailability = await AsyncStorage.getItem('availability');
        if (storedAvailability !== null) {
          setForm((prevForm) => ({
            ...prevForm,
            available: storedAvailability === 'true',
          }));
        }

        const response = await axios.get(`http://localhost:3000/api/professionals/${id}`);
        if (response.status === 200) {
          const { available, consultationFee } = response.data.professional;
          setForm((prevForm) => ({
            ...prevForm,
            available,
            consultationFee: consultationFee.toString(),
          }));

          await AsyncStorage.setItem('availability', available.toString());
        } else {
          throw new Error('Failed to fetch initial state');
        }
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      }
    };

    fetchUserId();
  }, []);

  const handleSwitchChange = (key: keyof FormState, value: boolean) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  };

  const handleAvailabilityChange = async (availability: boolean) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/professionals/update-availability/${userId}`, {
        availability,
      });

      if (response.status === 200) {
        setForm({ ...form, available: availability });

        await AsyncStorage.setItem('availability', availability.toString());

        Alert.alert('Success', `Availability updated to ${availability ? 'Available' : 'Not Available'}`);
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleConsultationFeeChange = (fee: string) => {
    setForm({ ...form, consultationFee: fee });
  };

  const updateConsultationFee = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/professionals/update-consultation-fee/${userId}`, {
        consultationFee: parseFloat(form.consultationFee),
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Consultation fee updated successfully');
      } else {
        throw new Error('Failed to update consultation fee');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <View style={styles.rowSpacer} />
            <Switch
              onValueChange={(value) => handleSwitchChange('darkMode', value)}
              value={form.darkMode}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email Notifications</Text>
            <View style={styles.rowSpacer} />
            <Switch
              onValueChange={(value) => handleSwitchChange('emailNotifications', value)}
              value={form.emailNotifications}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <View style={styles.rowSpacer} />
            <Switch
              onValueChange={(value) => handleSwitchChange('pushNotifications', value)}
              value={form.pushNotifications}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#28a745' }]}>
              <Feather color="#fff" name="user-check" size={20} />
            </View>
            <Text style={styles.rowLabel}>Available</Text>
            <View style={styles.rowSpacer} />
            <Switch
              onValueChange={handleAvailabilityChange}
              value={form.available}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: '#007afe' }]}>
              <Feather color="#fff" name="dollar-sign" size={20} />
            </View>
            <Text style={styles.rowLabel}>Consultation Fee</Text>
            <View style={styles.rowSpacer} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={form.consultationFee}
              onChangeText={handleConsultationFeeChange}
              onBlur={updateConsultationFee}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: 100,
  },
});
