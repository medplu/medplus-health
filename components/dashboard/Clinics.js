import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import GlobalApi from '../../Services/GlobalApi';
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const Clinics = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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
  const handlePress = async (item) => {
    try {
      await AsyncStorage.setItem(`clinic_${item._id}`, JSON.stringify(item));
      router.push({
        pathname: `/hospital/book-appointment/${item._id}`,
        params: { clinicId: item._id }
      });
    } catch (error) {
      console.error('Failed to store clinic data', error);
    }
  };

  const renderClinicItem = ({ item }) => {
    const imageUrl = item.image || null;

    return (
      <TouchableOpacity style={styles.clinicItem} onPress={() => handlePress(item)}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.clinicImage} />
        ) : (
          <Text style={styles.noImageText}>No Image</Text>
        )}
        <View style={styles.nameCategoryContainer}>
          <Text style={styles.clinicName}>{item.name}</Text>
          <Text style={styles.clinicCategory}>{item.category}</Text>
        </View>
        <Text style={styles.clinicContact}>{item.contactInfo}</Text>
        <Text style={styles.clinicAddress}>{item.address}</Text>
      </TouchableOpacity>
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
  nameCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clinicName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
  },
  clinicCategory: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 16,
    color: Colors.GRAY,
  },
  clinicContact: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  clinicAddress: {
    color: Colors.GRAY,
    marginTop: 5,
  },
  noImageText: {
    textAlign: 'center',
    color: Colors.GRAY,
    marginTop: 20,
  },
});

export default Clinics;