import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
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
      <Text h4 style={styles.title}>Join Clinic</Text>
      <Input
        placeholder="Enter Reference Code"
        value={referenceCode}
        onChangeText={setReferenceCode}
        containerStyle={styles.input}
      />
      <Button
        title="Join"
        onPress={handleJoinClinic}
        buttonStyle={styles.joinButton}
      />
      <Button
        title="Cancel"
        onPress={onClose}
        buttonStyle={styles.cancelButton}
        type="outline"
      />
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
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    marginBottom: 10,
  },
  cancelButton: {
    borderColor: Colors.SECONDARY,
  },
});

export default JoinClinicForm;