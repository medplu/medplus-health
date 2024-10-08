import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SharedHeader from '../../components/common/SharedHeader';
import Colors from '../../components/Shared/Colors';
import HospitalInfo from '../../components/HospitalInfo';

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

export default function HospitalDetails() {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const router = useRouter();
  const { clinicId } = useLocalSearchParams();

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const storedClinicData = await AsyncStorage.getItem(`clinic_${clinicId}`);
        if (storedClinicData) {
          setClinic(JSON.parse(storedClinicData));
        }
      } catch (error) {
        console.error('Failed to fetch clinic data', error);
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
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ position: 'absolute', margin: 15, zIndex: 10 }}>
        <SharedHeader title={clinic.name || ''} />
      </View>

      <View>
        {clinic.image ? (
          <Image 
            source={{ uri: clinic.image }}
            style={{ width: '100%', height: 260 }}
          />
        ) : (
          <Text>Image not available</Text>
        )}

        <View style={{ marginTop: -20, backgroundColor: Colors.white, borderTopRightRadius: 20, borderTopLeftRadius: 20, padding: 20 }}>
          <HospitalInfo clinic={clinic} />
        </View>
      </View>

      <TouchableOpacity
        onPress={async () => {
          try {
            await AsyncStorage.setItem('clinicData', JSON.stringify(clinic));
            router.push(`/hospital/book-appointment/${clinic._id}`);
          } catch (error) {
            console.error('Failed to store clinic data', error);
          }
        }}
        style={{ backgroundColor: Colors.primary, borderRadius: 99, padding: 13, margin: 10, marginBottom: 10 }}
      >
        <Text style={{ fontSize: 20, textAlign: 'center', color: Colors.white, fontFamily: 'Inter-Black-Semi' }}>
          Book Appointment
        </Text>
      </TouchableOpacity>
    </View>
  );
}