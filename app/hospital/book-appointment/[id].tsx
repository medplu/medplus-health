import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native'; // Changed ScrollView to FlatList
import { useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HospitalAppointementInfo from '../../../components/BookAppointement/HospitalAppointementInfo';
import HorizontalLine from '../../../components/common/HorizontalLine';
import BookingSection from '../../../components/BookAppointement/BookingSection';
import ActionButton from '../../../components/common/ActionButton';
import StaticDoctors from '@/components/clinics/StaticDoctors';
import Colors from '../../../components/Shared/Colors';
import { fetchClinicById, selectClinicDetails, selectClinicLoading, selectClinicError } from '../../store/clinicSlice';

const BookAppointment = () => {
  const { id: clinicId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const bookingSectionRef = useRef<View>(null);
  const navigation = useNavigation();
  
  const dispatch = useDispatch();
  const clinic = useSelector(selectClinicDetails);
  const loading = useSelector(selectClinicLoading);
  const error = useSelector(selectClinicError);

  useEffect(() => {
    if (clinicId) {
      dispatch(fetchClinicById(clinicId));
    }
  }, [clinicId, dispatch]);

  console.log('Clinic Data:', clinic);
  console.log('Loading:', loading);
  console.log('Error:', error);

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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load clinic data.</Text>
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No clinic found.</Text>
      </View>
    );
  }

  const { professionals = [], doctors = [] } = clinic;

  const doctorsData = [
    ...professionals.map(professional => ({
      _id: professional._id,
      name: `${professional.firstName} ${professional.lastName}`,
      specialties: [professional.category || professional.profession],
      profileImage: professional.profileImage,
      consultationFee: professional.consultationFee || 0,
    })),
    ...doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      specialties: doctor.specialties || [],
      profileImage: doctor.profileImage,
      consultationFee: doctor.consultationFee || 0,
    }))
  ];

  console.log('Doctors Data:', doctorsData);

  const renderItem = () => (
    <>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
      </TouchableOpacity>
      <HospitalAppointementInfo clinic={clinic} />
      <View ref={bookingSectionRef}>
        <BookingSection clinic={clinic} navigation={undefined} />
      </View>
      <StaticDoctors doctors={doctorsData} loading={loading} onBookPress={handleBookPress} />
      <ActionButton />
      <HorizontalLine />
    </>
  );

  return (
    // Changed ScrollView to FlatList with vertical orientation
    <FlatList
      data={[clinic]} // Use a single-item array to render components
      renderItem={renderItem}
      keyExtractor={() => 'clinic'}
      ListFooterComponent={<HorizontalLine />}
      contentContainerStyle={styles.container}
    />
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
