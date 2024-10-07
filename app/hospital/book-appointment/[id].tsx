import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router'; // Import useLocalSearchParams
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import HospitalAppointementInfo from '../../../components/BookAppointement/HospitalAppointementInfo';
import HorizontalLine from '../../../components/common/HorizontalLine';
import BookingSection from '../../../components/BookAppointement/BookingSection';
import ActionButton from '../../../components/common/ActionButton';

interface Doctor {
  _id: string;
  name: string;
  specialties: string[];
  experience: string;
}

interface Clinic {
  _id: string;
  name: string;
  contactInfo: string;
  address: string;
  image?: string;
  category: string;
  doctors: Doctor[];
  __v: number;
}

const BookAppointment = () => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const { id: clinicId } = useLocalSearchParams(); // Get clinic ID from query params

  useEffect(() => {
    console.log('clinicId:', clinicId); // Log the clinicId to debug

    const fetchClinicData = async () => {
      try {
        const storedClinicData = await AsyncStorage.getItem(`clinic_${clinicId}`);
        console.log('storedClinicData:', storedClinicData); // Log the stored data to debug

        if (storedClinicData) {
          const parsedClinicData = JSON.parse(storedClinicData);
          console.log('parsedClinicData:', parsedClinicData); // Log the parsed data to debug
          setClinic(parsedClinicData);
        }
      } catch (error) {
        console.error('Failed to load clinic data', error);
      }
    };

    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  if (!clinic) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: '50%' }}>
        <Text style={{ fontSize: 45 }}>Loading...</Text>
      </View>
    );
  }

  console.log('clinic:', clinic); // Log the clinic object to debug

  return (
    <ScrollView style={{ padding: 20 }}>
      <HospitalAppointementInfo clinic={clinic} />
      <BookingSection clinic={clinic} /> 
      <ActionButton />
      <HorizontalLine />
    </ScrollView>
  );
}

export default BookAppointment;