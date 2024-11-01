// Clinics.tsx
import React, { useEffect } from 'react';
import { View, FlatList, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClinics, filterClinics, selectClinics } from '../../app/store/clinicSlice'; // Update the import path as needed
import SubHeading from '../dashboard/SubHeading';
import Colors from '../Shared/Colors';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const Clinics = ({ searchQuery, onViewAll }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [fontsLoaded] = useFonts({
    'SourceSans3-Bold': require('../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const { filteredClinicList, loading, error } = useSelector(state => ({
    filteredClinicList: selectClinics(state),
    loading: state.clinics.loading,
    error: state.clinics.error,
  }));

  useEffect(() => {
    dispatch(fetchClinics()); // Fetch clinics when component mounts
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery) {
      dispatch(filterClinics({ searchQuery })); // Filter clinics when searchQuery changes
    }
  }, [searchQuery, dispatch]);

  const handlePress = async (item) => {
    router.push({
      pathname: `/hospital/book-appointment/${item._id}`,
      params: { clinicId: item._id },
    });
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
        data={filteredClinicList}
        horizontal={true} // Ensure this orientation is different from parent lists
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
