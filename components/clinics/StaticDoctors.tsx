import React from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import { useNavigation } from '@react-navigation/native'; 
interface Doctor {
  _id: string;
  name: string; // Update: name is a single string now
  specialties: string[];
  profileImage?: string;
  consultationFee: number;
}

interface StaticDoctorsProps {
  doctors: Doctor[];
  loading: boolean;
  
}


const StaticDoctors: React.FC<StaticDoctorsProps> = ({ doctors, loading, onBookPress }) => {
  const navigation = useNavigation();

  const handleConsult = (doctor: Doctor) => {
    navigation.navigate('doctor/index', { doctor: JSON.stringify(doctor) });
  };
 
  return (
    <View style={styles.container}>
      <SubHeading subHeadingTitle={'Consult a Specialist'} onViewAll={() => {}} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={doctors}
          horizontal={true}
          renderItem={({ item }) => (
            <View style={styles.doctorItem}>
              <Image 
                source={{ 
                  uri: item.profileImage ? item.profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' 
                }} 
                style={styles.doctorImage} 
              />
              <View style={styles.nameCategoryContainer}>
                <Text style={styles.doctorName}>{item.name}</Text> 
                <Text style={styles.doctorSpecialty}>{item.specialties.join(', ')}</Text> 
              </View>
              <Text style={styles.consultationFee}>Consultation Fee: {item.consultationFee} KES</Text>
              <TouchableOpacity style={[styles.button, styles.consultButton]} onPress={() => handleConsult(item)}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item._id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingVertical: 10,
  },
  doctorItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  doctorImage: {
    width: '100%',
    height: 120,
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
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
  },
  doctorSpecialty: {
    color: Colors.PRIMARY,
    fontSize: 12,
    textAlign: 'right',
    flex: 1,
  },
  consultationFee: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 5,
    textAlign: 'center',
  },
  consultButton: {
    backgroundColor: Colors.LIGHT_GRAY,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default StaticDoctors;
