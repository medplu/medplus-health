import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClinics,
  filterClinics,
  selectClinics,
  clearClinics,
} from '../../app/store/clinicSlice';
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

  const { filteredClinicList, loading, error } = useSelector(state => ({
    filteredClinicList: selectClinics(state),
    loading: state.clinics.loading,
    error: state.clinics.error,
  }));

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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

  const handlePress = item => {
    router.push({
      pathname: `/hospital/book-appointment/${item._id}`,
      params: { clinicId: item._id },
    });
  };

  const handleResetClinics = () => {
    dispatch(clearClinics());
  };

  const ClinicItem = ({ item }) => {
    const [currentImage, setCurrentImage] = useState(null);
    const imageFadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const allImages = new Set(item.images || []);
      item.professionals?.forEach(professional => {
        professional.clinic_images?.forEach(image => {
          if (image.urls?.[0]) {
            allImages.add(image.urls[0]);
          }
        });
      });

      const imageArray = Array.from(allImages);
      if (imageArray.length > 0) {
        setCurrentImage(imageArray[0]); 

        if (imageArray.length > 1) {
          let imageIndex = 0;
          const interval = setInterval(() => {
            imageIndex = (imageIndex + 1) % imageArray.length;

            Animated.timing(imageFadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setCurrentImage(imageArray[imageIndex]);
              Animated.timing(imageFadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            });
          }, 10000);

          return () => clearInterval(interval); 
        }
      } else {
        setCurrentImage(null);
      }
    }, [item.images, item.professionals]);

    return (
      <TouchableOpacity style={styles.clinicItem} onPress={() => handlePress(item)}>
        {currentImage ? (
          <Animated.Image
            source={{ uri: currentImage }}
            style={[styles.clinicImage, { opacity: imageFadeAnim }]}
          />
        ) : (
          <Animated.Image
            source={{ uri: 'https://via.placeholder.com/200x100?text=No+Image' }}
            style={styles.clinicImage}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.clinicCategory} numberOfLines={1}>{item.category}</Text>
          <Text style={styles.clinicAddress} numberOfLines={1}>{item.address}</Text>
          
          
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
  },
  clinicName: {
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clinicAddress: {
    color: Colors.primary,
  },
  clinicCategory: {
    color: Colors.primary,
    marginTop: 5,
  },
  clinicContact: {
    color: Colors.primary,
    marginTop: 5,
  },
  clinicSpecialties: {
    color: Colors.primary,
    marginTop: 5,
  },
  clinicLanguages: {
    color: Colors.primary,
    marginTop: 5,
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
