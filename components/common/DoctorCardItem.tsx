import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import Colors from '../Shared/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { firstName, lastName, profession, profileImage, _id } = doctor;
  const [isFavorite, setIsFavorite] = useState(false);
  const user = useSelector(selectUser);
  const userId = user.userId;

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('https://medplus-health.onrender.com/api/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoriteProfessionalIds = response.data.favoriteDoctors.map((doc: Doctor) => doc._id);
        setIsFavorite(favoriteProfessionalIds.includes(_id));
      } catch (error) {
        console.error("Error fetching favorite status:", error);
      }
    };

    checkFavorite();
  }, [ _id ]);

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !userId) {
        // Handle unauthenticated state
        return;
      }

      if (isFavorite) {
        await axios.post('https://medplus-health.onrender.com/api/removeFavorite', { userId, professionalId: _id }, { // Updated key
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('https://medplus-health.onrender.com/api/addFavorite', { userId, professionalId: _id }, { // Updated key
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

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
      <TouchableOpacity onPress={toggleFavorite}>
        <Icon name={isFavorite ? "heart" : "heart-o"} type="font-awesome" color={Colors.primary} />
      </TouchableOpacity>
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