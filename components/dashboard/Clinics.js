import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet } from 'react-native';
import GlobalApi from '../../Services/GlobalApi';
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

const Clinics = () => {
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const [clinicList, setClinicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const resp = await GlobalApi.getClinics();
      console.log('Response from backend:', resp);

      if (resp.status === 200 && Array.isArray(resp.data)) {
        setClinicList(resp.data);
        console.log('Clinic list set:', resp.data);
      } else {
        console.error('Unexpected response structure or status:', resp);
        setError('Failed to fetch clinic data');
      }
    } catch (error) {
      setError('Error fetching clinics');
      if (error.response) {
        console.error('Error response:', error.response);
      } else {
        console.error('Error fetching clinics:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderClinicItem = ({ item }) => {
    const imageUrl = item.image || null;

    return (
      <View style={styles.clinicItem}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.clinicImage} />
        ) : (
          <Text style={styles.noImageText}>No Image</Text>
        )}
        <Text style={styles.clinicName}>{item.name}</Text>
        <Text style={styles.clinicAddress}>{item.address}</Text>
        <Text style={styles.clinicContact}>{item.contactInfo}</Text>
        <Text style={styles.clinicCategory}>{item.category}</Text>
        <Text style={styles.clinicDoctorsTitle}>Doctors:</Text>
        {item.doctors.map(doctor => (
          <View key={doctor._id} style={styles.doctorItem}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpecialties}>{doctor.specialties.join(', ')}</Text>
            <Text style={styles.doctorExperience}>{doctor.experience}</Text>
          </View>
        ))}
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
      <SubHeading subHeadingTitle={'Discover Clinics Near You'} />
      <FlatList
        data={clinicList}
        horizontal={true}
        renderItem={renderClinicItem}
        keyExtractor={item => item._id.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  clinicItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  clinicImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  clinicName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
    marginTop: 10,
  },
  clinicAddress: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  clinicContact: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  clinicCategory: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  clinicDoctorsTitle: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 14,
    marginTop: 10,
  },
  doctorItem: {
    marginTop: 5,
  },
  doctorName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 14,
  },
  doctorSpecialties: {
    color: Colors.GRAY,
  },
  doctorExperience: {
    color: Colors.GRAY,
  },
  noImageText: {
    textAlign: 'center',
    color: Colors.GRAY,
    marginTop: 20,
  },
});

export default Clinics;