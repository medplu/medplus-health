import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/components/Shared/Colors';

interface Slot {
  day: string;
  time: string;
  isBooked: boolean;
}

interface SetAvailabilityFormProps {
  professionalId: string | null;
  onClose: () => void;
}

const SetAvailabilityForm: React.FC<SetAvailabilityFormProps> = ({ professionalId, onClose }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      if (!professionalId) return;
      try {
        const response = await fetch(`https://medplus-health.onrender.com/api/professionals/${professionalId}`);
        const professional = await response.json();
        setSlots(professional.slots || []);
      } catch (error) {
        console.error('Error fetching slots:', error);
      }
    };

    fetchSlots();
  }, [professionalId]);

  const addSlot = () => {
    setSlots([...slots, { day, time, isBooked: false }]);
    setDay('');
    setTime('');
  };

  const saveSlots = async () => {
    if (!professionalId) return;
    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/professionals/${professionalId}/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slots }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Availability slots updated successfully');
        onClose();
      } else {
        throw new Error('Failed to update slots');
      }
    } catch (error) {
      console.error('Error saving slots:', error);
      Alert.alert('Error', 'Could not update the slots');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Availability</Text>
      <TextInput
        placeholder="Day"
        value={day}
        onChangeText={setDay}
        style={styles.input}
      />
      <TextInput
        placeholder="Time"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />
      <Button title="Add Slot" onPress={addSlot} />
      <FlatList
        data={slots}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.slot}>
            <Text>{item.day} at {item.time}</Text>
          </View>
        )}
      />
      <Button title="Save" onPress={saveSlots} />
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  slot: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
});

export default SetAvailabilityForm;