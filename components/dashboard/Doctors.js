import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; 
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const Doctors = () => {
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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

  const handleConsult = async (getId) => {
    navigation.navigate('doctor/index', {
      doctorId: getId, }); // Pass doctorId as a parameter
  };

  const renderDoctorItem = ({ item }) => {
    const doctor = item;
    const imageUrl = doctor.image?.url;
    const consultationFee = doctor.consultationFee; // Hardcoded consultation fee
    const placeholderImageUrl = 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg'; // Replace with your Cloudinary placeholder URL

    return (
      <View style={styles.doctorItem}>
        <Image 
          source={{ uri: imageUrl || placeholderImageUrl }} 
          style={styles.doctorImage} 
        />
        <View style={styles.nameCategoryContainer}>
          <Text style={styles.doctorName}>{`${doctor.firstName} ${doctor.lastName}`}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.category}</Text>
        </View>
        <Text style={styles.consultationFee}>Consultation: {consultationFee}</Text>
        <TouchableOpacity
          style={[styles.button, styles.consultButton]}
          onPress={() => handleConsult(doctor._id)}
        >
          <Text style={styles.buttonText}>Consult</Text>
        </TouchableOpacity>
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
  nameCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  doctorName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
  },
  doctorSpecialty: {
    color: Colors.GRAY,
    fontSize: 14,
  },
  consultationFee: {
    fontSize: 14,
    color: Colors.BLACK,
    marginTop: 5,
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
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Doctors;