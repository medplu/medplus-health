import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import Colors from '../components/Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ClinicDoctorsList = ({ route }) => {
  const [doctorList, setDoctorList] = useState([]);
  const [clinicList, setClinicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedDoctorList = await AsyncStorage.getItem('doctorList');
        const storedClinicList = await AsyncStorage.getItem('clinicList');
        if (storedDoctorList) setDoctorList(JSON.parse(storedDoctorList));
        if (storedClinicList) setClinicList(JSON.parse(storedClinicList));
      } catch (error) {
        console.error('Error retrieving data from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Combine doctors and clinics into a single list
  const combinedList = [
    ...doctorList.map(item => ({ ...item, type: 'Doctor' })),
    ...clinicList.map(item => ({ ...item, type: 'Clinic' })),
  ];

  // Filter the combined list based on search query and selected filter
  const filteredList = combinedList.filter(item => {
    const matchesSearchQuery = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'All' || item.type === filter;

    return matchesSearchQuery && matchesFilter;
  });

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.itemImage}
      />
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>
          {item.type === 'Clinic' ? item.name : `${item.firstName} ${item.lastName}`}
        </Text>
        <Text style={styles.itemSubtitle}>
          {item.type === 'Clinic' ? item.address : item.category}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.title}>All Clinics and Doctors</Text>
      </View>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'All' && styles.activeFilterButton]}
          onPress={() => setFilter('All')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Doctor' && styles.activeFilterButton]}
          onPress={() => setFilter('Doctor')}
        >
          <Text style={styles.filterButtonText}>Doctors</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'Clinic' && styles.activeFilterButton]}
          onPress={() => setFilter('Clinic')}
        >
          <Text style={styles.filterButtonText}>Clinics</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredList}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.ligh_gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBar: {
    height: 40,
    borderColor: Colors.gray,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  activeFilterButton: {
    backgroundColor: Colors.PRIMARY,
  },
  filterButtonText: {
    color: Colors.gray,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClinicDoctorsList;