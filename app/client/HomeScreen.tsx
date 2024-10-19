import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsResponse, clinicsResponse] = await Promise.all([
        axios.get('https://medplus-app.onrender.com/api/professionals'),
        axios.get('https://medplus-app.onrender.com/api/clinics'),
      ]);
      setDoctorList(doctorsResponse.data);
      setClinicList(clinicsResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = (type) => {
    console.log('Navigating to ClinicDoctorsList with type:', type); // Debugging log
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
        return (
          <Doctors
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onViewAll={() => handleViewAll('Doctors')}
          />
        );
      case 'clinics':
        return (
          <Clinics
            searchQuery={searchQuery}
            onViewAll={() => handleViewAll('Clinics')}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ligh_gray,
    padding: 20,
  },
  scrollView: {
    paddingVertical: 20,
    backgroundColor: Colors.ligh_gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});