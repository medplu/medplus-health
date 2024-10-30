import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import SubHeading from '../dashboard/SubHeading';
import Colors from '../../components/Shared/Colors';	
import useDoctors from '../../hooks/useDoctors';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  profileImage?: string;
  consultationFee: number;
}

interface DoctorsProps {
  searchQuery: string;
  selectedCategory: string;
  onViewAll: (category: string) => void;
}

const Doctors: React.FC<DoctorsProps> = ({ searchQuery, selectedCategory, onViewAll }) => {
  const { doctorList, loading, error } = useDoctors();
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, selectedCategory, doctorList]);

  const filterDoctors = () => {
    let filtered = doctorList;

    if (searchQuery) {
      filtered = filtered.filter((doctor) =>
        doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((doctor) => doctor.category === selectedCategory);
    }

    setFilteredDoctors(filtered);
  };

  const handleConsult = (doctor: Doctor) => {
    navigation.navigate('doctor/index', { doctor: JSON.stringify(doctor) });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error fetching doctors: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle="Discover Doctors Near You" onViewAll={() => onViewAll('Doctors')} />
      <FlatList
        data={filteredDoctors}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.doctorItem}>
            <Image
              source={{ uri: item.profileImage || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
              style={styles.doctorImage}
            />
            <View style={styles.nameCategoryContainer}>
              <Text style={styles.doctorName}>{`${item.firstName} ${item.lastName}`}</Text>
              <Text >{item.category}</Text>
            </View>
            <Text style={styles.consultationFee}>
          {item.consultationFee ? `Consultation Fee: ${item.consultationFee}` : 'Consultation Fee: Not available'}
        </Text>
            <TouchableOpacity style={[styles.button, styles.consultButton]} onPress={() => handleConsult(item)}>
              <Text style={styles.buttonText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item._id.toString()}
        showsHorizontalScrollIndicator={false}
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
    flexDirection: 'column',
    justifyContent: 'center',
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
    color: Colors.green,
    marginTop: 5,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  consultButton: {
    backgroundColor: Colors.GREEN,
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
