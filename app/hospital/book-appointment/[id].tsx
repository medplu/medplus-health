import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { id: clinicId } = useLocalSearchParams();

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const storedClinicData = await AsyncStorage.getItem(`clinic_${clinicId}`);
        if (storedClinicData) {
          const parsedClinicData = JSON.parse(storedClinicData);
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