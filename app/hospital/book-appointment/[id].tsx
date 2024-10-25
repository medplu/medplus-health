import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HospitalAppointementInfo from '../../../components/BookAppointement/HospitalAppointementInfo';
import HorizontalLine from '../../../components/common/HorizontalLine';
import BookingSection from '../../../components/BookAppointement/BookingSection';
import ActionButton from '../../../components/common/ActionButton';
import StaticCategory from '@/components/clinics/StaticCategory';
import StaticDoctors from '@/components/clinics/StaticDoctors';
import Colors from '../../../components/Shared/Colors';

interface Doctor {
  _id: string;
  name: string;
  specialties: string[];
  experience: string;
  profileImage?: string;
  consultationFee: number;
}

interface Clinic {
  _id: string;
  name: string;
  contactInfo: string;
  address: string;
  image?: string;
  category: string;
  doctors: Doctor[];
  professional: {
    firstName: string;
    lastName: string;
    category: string;
    profileImage?: string;
    consultationFee: number;
  };
  __v: number;
}

const BookAppointment = () => {
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id: clinicId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const bookingSectionRef = useRef<View>(null);
  const navigation = useNavigation();

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
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  const handleBookPress = () => {
    if (bookingSectionRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: bookingSectionRef.current.offsetTop,
        animated: true,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load clinic data.</Text>
      </View>
    );
  }

  const categories = [
    clinic.professional.category,
    ...clinic.doctors.map(doctor => doctor.specialties).flat()
  ];

  const doctors = [
    {
      _id: clinic.professional._id,
      firstName: clinic.professional.firstName,
      lastName: clinic.professional.lastName,
      category: clinic.professional.category,
      profileImage: clinic.professional.profileImage,
      consultationFee: clinic.professional.consultationFee,
    },
    ...clinic.doctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.name.split(' ')[0],
      lastName: doctor.name.split(' ')[1],
      category: doctor.specialties[0],
      profileImage: doctor.profileImage,
      consultationFee: doctor.consultationFee,
    }))
  ];

  return (
    <ScrollView ref={scrollViewRef} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
      </TouchableOpacity>
      <HospitalAppointementInfo clinic={clinic} />
      <View ref={bookingSectionRef}>
        <BookingSection clinic={clinic} navigation={undefined} />
      </View>
      <StaticCategory categories={categories} />
      <StaticDoctors doctors={doctors} loading={loading} onBookPress={handleBookPress} />
      <ActionButton />
      <HorizontalLine />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.ligh_gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
  },
  errorText: {
    fontSize: 18,
    color: Colors.SECONDARY,
  },
  backButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: Colors.ligh_gray,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
});

export default BookAppointment;