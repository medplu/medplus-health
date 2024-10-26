import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import Colors from '../Shared/Colors';

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
    <View style={styles.header}>
      <Avatar
        rounded
        size="large"
        source={{ uri: profileImage ? profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
      />
      <View style={styles.headerText}>
        <Text style={styles.doctorName}>{firstName} {lastName}</Text>
        <Text style={styles.categoryName}>{category}</Text>
        <View style={styles.availabilityContainer}>
          <View style={[styles.availabilityDot, { backgroundColor: availability ? Colors.success : Colors.error }]} />
          <Text style={[styles.availabilityText, { color: availability ? Colors.success : Colors.error }]}>
            {availability ? 'Available' : 'Not Available'}
          </Text>
        </View>
      </View>
      <Icon name="heart" type="font-awesome" color={Colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 16,
    color: Colors.gray,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  availabilityText: {
    fontSize: 14,
  },
});

export default DoctorCardItem;