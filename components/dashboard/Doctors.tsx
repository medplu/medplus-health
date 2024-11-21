import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native'; 
import SubHeading from '../dashboard/SubHeading';
import Colors from '../../components/Shared/Colors';	
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinics, selectClinics } from '../../app/store/clinicSlice';
import { useRouter } from 'expo-router';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  profileImage?: string;
  consultationFee: number;
  clinicId: string;
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

  useEffect(() => {
    dispatch(fetchClinics());
  }, [dispatch]);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedCategory, clinics]);

  const filterDoctors = () => {
    let doctors = clinics.flatMap(clinic => 
      clinic.professionals.map(professional => ({
        ...professional,
        clinicId: clinic._id,
        profileImage: professional.user.profileImage
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

    setFilteredDoctors(doctors);
  };

  const handleConsult = (doctor: Doctor) => {
    router.push({
      pathname: `/hospital/book-appointment/${doctor.clinicId}`,
      params: { clinicId: doctor.clinicId, doctorId: doctor._id, professional: JSON.stringify(doctor) },
    });
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
            <TouchableOpacity style={[styles.button, styles.consultButton]} onPress={() => handleConsult(item)}>
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
