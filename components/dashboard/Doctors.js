import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; 
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
const Doctors = () => {
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const [doctorList, setDoctorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    getDoctors();
  }, []);

  const getDoctors = async () => {
    try {
      const resp = await axios.get('https://medplus-app.onrender.com/api/professionals');
      if (resp?.data) {
        setDoctorList(resp.data);
      } else {
        setError('Failed to fetch doctor data');
      }
    } catch (error) {
      setError('Error fetching doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookDoctor = async (doctorId) => {
    try {
      const resp = await axios.post(`https://medplus-app.onrender.com/api/bookings`, { doctorId });
      if (resp.status === 200) {
        Alert.alert('Booking Successful', 'You have successfully booked the doctor.');
      } else {
        Alert.alert('Booking Failed', 'Failed to book the doctor.');
      }
    } catch (error) {
      console.error('Error booking doctor:', error);
      Alert.alert('Booking Error', 'An error occurred while booking the doctor.');
    }
  };

  const handleViewProfile = (getId) => {
    navigation.navigate('doctor/index', {
       doctorId: getId, }); // Pass doctorId as a parameter
  };

  const renderDoctorItem = ({ item }) => {
    const doctor = item;
    const imageUrl = doctor.image?.url;
    const consultationFee = doctor.consultationFee; // Hardcoded consultation fee
    const rating = 4.5; // Hardcoded doctor rating
    const placeholderImageUrl = 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg'; // Replace with your Cloudinary placeholder URL

    return (
      <View style={styles.doctorItem}>
        <Image 
          source={{ uri: imageUrl || placeholderImageUrl }} 
          style={styles.doctorImage} 
        />
        <Text style={styles.doctorName}>{`${doctor.firstName} ${doctor.lastName}`}</Text>
        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
        <Text style={styles.consultationFee}>Consultation: {consultationFee}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>Rating: {rating} ★</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.viewProfileButton]}
            onPress={() => handleViewProfile(doctor._id)}
          >
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.bookButton]}
            onPress={() => handleBookDoctor(doctor._id)}
          >
            <Text style={styles.buttonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={'Discover Doctors Near You'} />
      <FlatList
        data={doctorList}
        horizontal={true}
        renderItem={renderDoctorItem}
        keyExtractor={item => item._id.toString()}
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
    width: 220,
  },
  doctorImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  doctorName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
    marginTop: 10,
  },
  doctorSpecialty: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  consultationFee: {
    fontSize: 14,
    color: Colors.BLACK,
    marginTop: 5,
  },
  ratingContainer: {
    marginTop: 5,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.ORANGE,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  viewProfileButton: {
    backgroundColor: Colors.LIGHT_BLUE,
  },
  bookButton: {
    backgroundColor: Colors.GREEN,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 14,
  },
  noImageText: {
    textAlign: 'center',
    color: Colors.GRAY,
    marginTop: 20,
  },
});

export default Doctors;