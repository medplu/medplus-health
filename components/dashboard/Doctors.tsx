import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native'; 
import SubHeading from '../dashboard/SubHeading';
import Colors from '../../components/Shared/Colors';	
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinics, selectClinics } from '../../app/store/clinicSlice';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  profileImage?: string;
  consultationFee: number;
  clinicId: string;
  location?: string;
}

interface DoctorsProps {
  searchQuery: string;
  selectedCategory: string;
  onViewAll: (category: string) => void;
  excludeDoctorId?: string;
}

const Doctors: React.FC<DoctorsProps> = ({ searchQuery, selectedCategory, onViewAll, excludeDoctorId }) => {
  const dispatch = useDispatch();
  const clinics = useSelector(selectClinics);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const navigation = useNavigation();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [distanceThreshold, setDistanceThreshold] = useState<number>(10); // Distance threshold in kilometers

  useEffect(() => {
    dispatch(fetchClinics());
  }, [dispatch]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await AsyncStorage.getItem('userLocation');
        if (location) {
          setUserLocation(JSON.parse(location));
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;
            setUserLocation({ latitude, longitude });
            await AsyncStorage.setItem('userLocation', JSON.stringify({ latitude, longitude }));
          }
        }
      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedCategory, clinics, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterDoctors = () => {
    let doctors = clinics.flatMap(clinic => 
      clinic.professionals.map(professional => ({
        ...professional,
        clinicId: clinic._id,
        profileImage: professional.user.profileImage,
        location: clinic.address, // Assuming clinic has a location property
        clinicInsurances: clinic.insuranceCompanies, // Attach insurances to professionals
        clinicLatitude: clinic.latitude, // Assuming clinic has latitude property
        clinicLongitude: clinic.longitude // Assuming clinic has longitude property
      }))
    );

    clinics.forEach(clinic => {
      console.log('Clinic ID:', clinic._id);
      console.log('Professionals:', clinic.professionals);
    });

    if (excludeDoctorId) {
      doctors = doctors.filter((doctor) => doctor._id !== excludeDoctorId);
    }

    if (searchQuery) {
      doctors = doctors.filter((doctor) =>
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      doctors = doctors.filter((doctor) => doctor.category === selectedCategory);
    }

    if (userLocation) {
      doctors = doctors.filter((doctor) => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          doctor.clinicLatitude,
          doctor.clinicLongitude
        );
        return distance <= distanceThreshold;
      });
    }

    console.log('Filtered Doctors:', doctors); // Log the filtered doctors data

    setFilteredDoctors(doctors);
  };

  const handleConsult = (doctor: Doctor) => {
    const params: any = { doctor: JSON.stringify(doctor) };
    if (doctor.clinicInsurances && doctor.clinicInsurances.length > 0) {
      params.selectedInsurance = doctor.clinicInsurances;
    }
    navigation.navigate('doctor/index', params);
  };

  if (!clinics.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle="Discover Doctors Near You" onViewAll={() => onViewAll('Doctors')} />
      <FlatList
        data={filteredDoctors}
        horizontal
        renderItem={({ item, index }) => (
          <View style={styles.doctorItem}>
            <Image
              source={{ uri: item.profileImage || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
              style={styles.doctorImage}
            />
            <View style={styles.nameCategoryContainer}>
              <Text style={styles.doctorName}>{`${item.firstName} ${item.lastName}`}</Text>
              <Text style={styles.doctorName}>{item.profession}</Text>
            </View>
            <Text>{item.category}</Text>
            <Text>{item.location}</Text> {/* Display the doctor's location */}
            <TouchableOpacity style={[styles.button, styles.consultButton]} onPress={() => handleConsult({
              ...item,
              clinicInsurances: item.clinicInsurances // Attach insurances to the doctor
            })}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  doctorItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 240,
  },
  doctorImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  nameCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  doctorName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  doctorSpecialty: {
    color: Colors.GRAY,
    fontSize: 14,
    textAlign: 'center',
  },
  consultationFee: {
    fontSize: 16,
    color: Colors.PRIMARY,
    textAlign: 'right',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  consultButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Doctors;
