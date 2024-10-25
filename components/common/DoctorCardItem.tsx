import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  availability: boolean;
  user: string;
  profileImage?: string;
}

interface DoctorCardItemProps {
  doctor: Doctor;
}

const DoctorCardItem: React.FC<DoctorCardItemProps> = ({ doctor }) => {
  const { firstName, lastName, category, availability, profileImage } = doctor;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ 
            uri: profileImage ? profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' 
          }} 
          style={styles.profileImage}
        />
        <View style={styles.headerText}>
          <Text style={styles.doctorName}>Dr. {firstName} {lastName}</Text>
          <Text style={styles.categoryName}>{category}</Text>
          <Text style={[styles.categoryName, { color: availability ? 'green' : 'red' }]}>
            {availability ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>⭐⭐⭐⭐ 4.8 </Text>
        <Text style={styles.reviewText}>49 Reviews</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, 
  },
  ratingText: {
    fontWeight: 'bold',
  },
  reviewText: {
    color: '#666',
  },
});

export default DoctorCardItem;