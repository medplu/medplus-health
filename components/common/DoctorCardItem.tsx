import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-elements';
import Colors from '../Shared/Colors';
import { useSelector } from 'react-redux';
import { selectUser } from '../../app/store/userSlice';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  profession: string;
  user: string;
  profileImage?: string;
}

interface DoctorCardItemProps {
  doctor: Doctor;
}

const DoctorCardItem: React.FC<DoctorCardItemProps> = ({ doctor }) => {
  const { firstName, lastName, profession, profileImage } = doctor;
  const user = useSelector(selectUser);
  const userId = user.userId;

  return (
    <View style={styles.profileContainer}>
      <Avatar
        rounded
        size="large"
        source={{
          uri: profileImage
            ? profileImage
            : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg',
        }}
        containerStyle={styles.avatar}
      />
      <View style={styles.profileInfo}>
        <Text style={styles.doctorName}>{`${firstName} ${lastName}`}</Text>
        <Text style={styles.categoryName}>{profession}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.ligh_gray,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatar: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  categoryName: {
    fontSize: 16,
    color: Colors.gray,
    marginVertical: 4,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DoctorCardItem;