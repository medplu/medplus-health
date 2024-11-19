import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HorizontalLine from '../../../components/common/HorizontalLine';
import BookingSection from '../../../components/BookAppointement/BookingSection';
import ActionButton from '../../../components/common/ActionButton';
import StaticDoctors from '@/components/clinics/StaticDoctors';
import Colors from '../../../components/Shared/Colors';
import { fetchClinicById, selectClinicDetails, selectClinicLoading, selectClinicError } from '../../store/clinicSlice';
import ClinicSubHeading from '../../../components/clinics/ClinicSubHeading';
import EvilIcons from '@expo/vector-icons/EvilIcons';

const BookAppointment = () => {
  const { id: clinicId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const bookingSectionRef = useRef<View>(null);
  const navigation = useNavigation();
  
  const dispatch = useDispatch();
  const clinic = useSelector(selectClinicDetails);
  const loading = useSelector(selectClinicLoading);
  const error = useSelector(selectClinicError);

  const [showFullDesc, setShowFullDesc] = useState(false);

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

  const truncatedDesc = showFullDesc 
    ? clinic.bio || "No bio available."
    : (clinic.bio ? clinic.bio.split(" ").slice(0, 18).join(" ") : 'No bio available.');

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={Colors.WHITE} />
      </TouchableOpacity>

      <View style={styles.profileSection}>
        {clinic.images && clinic.images.length > 0 && (
          <Image source={{ uri: clinic.images[0] }} style={styles.profileImage} />
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{clinic.name}</Text>
          <View style={styles.infoRow}>
            <EvilIcons name="location" size={16} color={Colors.gray} />
            <Text style={styles.profileAddress}>{clinic.address}</Text>
          </View>
          <Text style={styles.profileContact}>{clinic.contactInfo}</Text>
        </View>
      </View>

      <ClinicSubHeading subHeadingTitle={'About'} />
      <Text style={styles.description}>{truncatedDesc}</Text>
      <TouchableOpacity onPress={() => setShowFullDesc(prev => !prev)}>
        <Text style={styles.seeMoreText}>
          {showFullDesc ? 'Hide' : 'See More'}
        </Text>
      </TouchableOpacity>

      <ClinicSubHeading subHeadingTitle={'Insurance Companies'} />
      <FlatList
        data={clinic.insuranceCompanies}
        horizontal={true}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.insuranceCard}>
            <Text style={styles.insurance}>{item}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.insuranceList}
      />

      <ClinicSubHeading subHeadingTitle={'Specialties'} />
      <FlatList
        data={clinic.specialties.split(',')}
        horizontal={true}
        renderItem={({ item }) => (
          <View style={styles.specialtyCard}>
            <Text style={styles.specialty}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtyList}
      />

      <View ref={bookingSectionRef}>
        <BookingSection clinic={clinic} navigation={undefined} />
      </View>
      <StaticDoctors doctors={doctorsData} loading={loading} />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileAddress: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 5,
  },
  profileContact: {
    fontSize: 14,
    color: Colors.gray,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  seeMoreText: {
    color: Colors.primary,
    fontSize: 14,
    marginBottom: 20,
  },
  insuranceCard: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
     borderColor: Colors.PRIMARY,
    borderRadius: 20,
    marginRight: 10,
  },
  insurance: {
    fontSize: 14,
    color: Colors.primary,
  },
  insuranceList: {
    marginBottom: 20,
  },
  specialtyCard: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 20,
    marginRight: 10,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary,
  },
  specialtyList: {
    marginBottom: 20,
  },
});

export default BookAppointment;
