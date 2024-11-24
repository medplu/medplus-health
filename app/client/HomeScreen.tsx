import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native';
import AppSearchBar from '../../components/dashboard/SearchBar';
import Category from '../../components/dashboard/Category';
import Doctors from '../../components/dashboard/Doctors';
import Clinics from '../../components/dashboard/Clinics';
import Colors from '../../components/Shared/Colors';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [clinicList, setClinicList] = useState([]);
  const [loading, setLoading] = useState({ doctors: true, clinics: true });
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await axios.get('https://medplus-app.onrender.com/api/professionals');
      setDoctorList(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError((prev) => ({ ...prev, doctors: 'Failed to load doctors' }));
    } finally {
      setLoading((prev) => ({ ...prev, doctors: false }));
    }
  }, []);

  const fetchClinics = useCallback(async () => {
    try {
      const response = await axios.get('https://medplus-app.onrender.com/api/clinics');
      setClinicList(response.data);
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError((prev) => ({ ...prev, clinics: 'Failed to load clinics' }));
    } finally {
      setLoading((prev) => ({ ...prev, clinics: false }));
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchClinics();
  }, [fetchDoctors, fetchClinics]);

  const handleViewAll = (type) => {
    navigation.navigate('ClinicDoctorsList', { type, doctorList, clinicList });
  };

  const data = [
    { key: 'searchBar' },
    { key: 'category' },
    { key: 'doctors' },
    { key: 'clinics' },
  ];

  const renderItem = ({ item }) => {
    switch (item.key) {
      case 'searchBar':
        return (
          <AppSearchBar
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
          />
        );
      case 'category':
        return (
          <Category
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => setSelectedCategory(category)}
          />
        );
      case 'doctors':
        return loading.doctors ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <Doctors
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onViewAll={() => handleViewAll('Doctors')}
            doctors={doctorList}
          />
        );
      case 'clinics':
        return loading.clinics ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <Clinics
            searchQuery={searchQuery}
            onViewAll={() => handleViewAll('Clinics')}
            clinics={clinicList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.doctors || error.clinics}</Text>
        </View>
      )}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light_gray,
    padding: 20,
  },
  scrollView: {
    paddingVertical: 20,
  },
  errorContainer: {
    backgroundColor: Colors.errorBackground,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: Colors.errorText,
    textAlign: 'center',
  },
});
