import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import GlobalApi from '../../Services/GlobalApi';
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const Clinics = ({ searchQuery, onViewAll }) => {
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
      if (resp.status === 200 && Array.isArray(resp.data)) {
        setClinicList(resp.data);
        await AsyncStorage.setItem('clinicList', JSON.stringify(resp.data)); // Save data to AsyncStorage
      } else {
        setError('Failed to fetch clinic data');
      }
    } catch (error) {
      setError('Error fetching clinics');
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinicList.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <View style={styles.textContainer}>
          <Text style={styles.clinicName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.clinicAddress} numberOfLines={1} ellipsizeMode="tail">{item.address}</Text>
          <Text style={styles.clinicCategory} numberOfLines={1} ellipsizeMode="tail">{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.GRAY} />;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle={'Discover Clinics Near You'} onViewAll={onViewAll} />
      <FlatList
        data={filteredClinics}
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
  textContainer: {
    marginTop: 5,
    width: '100%',
  },
  clinicName: {
    fontWeight: 'bold',
    color: Colors.primary,
    width: '100%',
  },
  clinicAddress: {
    color: Colors.primary,
    width: '100%',
  },
  clinicCategory: {
    color: Colors.primary,
    marginTop: 5,
    width: '100%',
  },
  noImageText: {
    textAlign: 'center',
    color: Colors.primary,
    marginTop: 20,
  },
});

export default Clinics;