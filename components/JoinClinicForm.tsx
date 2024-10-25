import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/components/Shared/Colors';

const JoinClinicForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null); // State to store userId

  useEffect(() => {
    // Fetch userId from AsyncStorage
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId); // Set userId from AsyncStorage
      } catch (error) {
        console.error('Failed to fetch userId from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleJoinClinic = async () => {
    if (!referenceCode) {
      Alert.alert('Error', 'Please enter a valid reference code.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try again later.');
      return;
    }

    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/clinics/join/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceCode }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('attachedToClinic', 'true');
        Alert.alert('Success', data.message);
        onClose(); // Close the form after joining the clinic
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join the clinic. Please try again later.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Clinic</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Reference Code"
        value={referenceCode}
        onChangeText={setReferenceCode}
      />
      <Button title="Join" onPress={handleJoinClinic} />
      <Button title="Cancel" onPress={onClose} color={Colors.SECONDARY} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default JoinClinicForm;
