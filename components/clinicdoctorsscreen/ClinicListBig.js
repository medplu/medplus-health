import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { FlatList } from 'react-native';
import ClinicCardItem from '../common/ClinicCardItem'; // Import ClinicCardItem from common
import { useRouter } from 'expo-router'; // Import useRouter
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

export default function ClinicListBig({ clinicDoctorsList }) {
  const router = useRouter(); // Initialize router

  const handlePress = async (item) => {
    try {
      // Store clinic data in AsyncStorage with a unique key
      await AsyncStorage.setItem(`clinic_${item._id}`, JSON.stringify(item));
      console.log(`Stored clinic_${item._id}:`, JSON.stringify(item)); // Log the stored data to debug

      // Navigate to the BookAppointment screen with the clinic ID
      router.push({
        pathname: `/hospital/book-appointment/${item._id}`, // Use _id instead of id
        params: { clinicId: item._id } // Pass clinic ID
      });
    } catch (error) {
      console.error('Failed to store clinic data', error);
    }
  };

  return (
    <View style={{ marginTop: 15 }}> 
      <FlatList
        data={clinicDoctorsList}
        keyExtractor={(item) => item._id.toString()} // Use _id instead of id
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <ClinicCardItem clinic={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}