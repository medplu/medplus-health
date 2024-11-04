import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AdditionalInfoScreen: React.FC = ({ navigation }) => {
  const [profession, setProfession] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  // Add other fields as needed

  const handleSave = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      const response = await fetch('https://medplus-health.onrender.com/auth/additional-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profession,
          consultationFee,
          // Add other fields as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save additional info');
      }

      navigation.push('/client/tabs');
    } catch (error) {
      console.error('Error saving additional info:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Profession</Text>
      <TextInput value={profession} onChangeText={setProfession} style={styles.input} />
      <Text>Consultation Fee</Text>
      <TextInput value={consultationFee} onChangeText={setConsultationFee} style={styles.input} />
      {/* Add other fields as needed */}
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
  },
});

export default AdditionalInfoScreen;
