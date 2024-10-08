import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { FlatList } from 'react-native';
import ClinicCardItem from '../common/ClinicCardItem';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClinicListBig({ clinicDoctorsList }) {
  const router = useRouter();

  const handlePress = async (item) => {
    try {
      await AsyncStorage.setItem(`clinic_${item._id}`, JSON.stringify(item));
      router.push({
        pathname: `/hospital/book-appointment/${item._id}`,
        params: { clinicId: item._id }
      });
    } catch (error) {
      console.error('Failed to store clinic data', error);
    }
  };

  return (
    <View style={{ marginTop: 15 }}>
      <FlatList
        data={clinicDoctorsList}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <ClinicCardItem clinic={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}