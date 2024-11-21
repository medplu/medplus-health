// Clinics.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClinics, filterClinics, selectClinics, resetClinics, clearClinics } from '../../app/store/clinicSlice'; // Update the import path as needed
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

  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    dispatch(fetchClinics());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery) {
      dispatch(filterClinics({ searchQuery })); 
    }
  }, [searchQuery, dispatch]);

  useEffect(() => {
    if (!loading && filteredClinicList.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, filteredClinicList]);

  const handlePress = async (item) => {
    router.push({
      pathname: `/hospital/book-appointment/${item._id}`,
      params: { clinicId: item._id },
    });
  };

  const handleResetClinics = () => {
    dispatch(clearClinics());
  };

  const ClinicItem = ({ item }) => {
    const [currentImage, setCurrentImage] = useState(item.images && item.images.length > 0 ? item.images[0] : null);
    const imageFadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (item.images && item.images.length > 1) {
        const interval = setInterval(() => {
          const randomIndex = Math.floor(Math.random() * item.images.length);
          const nextImage = item.images[randomIndex];

          Animated.timing(imageFadeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start(() => {
            setCurrentImage(nextImage);
            Animated.timing(imageFadeAnim, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }).start();
          });
        }, 10000); // Change image every 3 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
      }
    }, [item.images]);

    return (
      <TouchableOpacity style={styles.clinicItem} onPress={() => handlePress(item)}>
        {currentImage ? (
          <Animated.Image source={{ uri: currentImage }} style={[styles.clinicImage, { opacity: imageFadeAnim }]} />
        ) : (
          <Text style={styles.noImageText}>No Image</Text>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.clinicName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
          <Text style={styles.clinicCategory} numberOfLines={1} ellipsizeMode="tail">{item.category}</Text>
          <Text style={styles.clinicAddress} numberOfLines={1} ellipsizeMode="tail">{item.address}</Text>
          <Text style={styles.clinicContact} numberOfLines={1} ellipsizeMode="tail">{item.contactInfo}</Text>
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
    <Animated.View style={{ marginTop: 10, opacity: fadeAnim }}>
      <SubHeading subHeadingTitle={'Discover Clinics Near You'} onViewAll={onViewAll} />
      <TouchableOpacity style={styles.resetButton} onPress={handleResetClinics}>
        <Text style={styles.resetButtonText}>Reset Clinics</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredClinicList}
        horizontal={true} 
        renderItem={({ item }) => <ClinicItem item={item} />}
        keyExtractor={item => item._id.toString()}
        showsHorizontalScrollIndicator={false}
      />
    </Animated.View>
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
  clinicContact: {
    color: Colors.primary,
    marginTop: 5,
    width: '100%',
  },
  noImageText: {
    textAlign: 'center',
    color: Colors.primary,
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Clinics;
