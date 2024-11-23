import { StyleSheet, TextInput, SafeAreaView, Text, View, FlatList, Image, TouchableOpacity, StatusBar} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import GlobalApi from '../../Services/GlobalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectAllClinics, selectSpecialties } from '../store/clinicSlice';
import { Ionicons } from '@expo/vector-icons';

const index = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryQuery } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [filter, setFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(categoryQuery ? [categoryQuery] : []);
  const clinics = useSelector((state) => selectAllClinics(state));
  const specialties = useSelector((state) => selectSpecialties(state));
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    handleSearch(searchQuery, specialty);
  }, [categoryQuery, clinics, specialty]);

  useEffect(() => {
    console.log('Clinics data:', clinics);
    if (clinics.length > 0) {
      console.log('Sample clinic data:', clinics[0]);
    }
  }, [clinics]);

  const handleSearch = (query, selectedSpecialty = specialty) => {
    setSearchQuery(query);
    const filtered = clinics.filter((clinic) =>
      (clinic.name && clinic.name.toLowerCase().includes(query.toLowerCase())) ||
      (clinic.address && clinic.address.toLowerCase().includes(query.toLowerCase())) ||
      (clinic.category && clinic.category.toLowerCase().includes(query.toLowerCase())) ||
      (selectedSpecialty !== 'all' && clinic.specialties && clinic.specialties.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    );

    const professionals = filtered.flatMap(clinic => clinic.professionals).filter(professional =>
      (professional.firstName && professional.firstName.toLowerCase().includes(query.toLowerCase())) ||
      (professional.lastName && professional.lastName.toLowerCase().includes(query.toLowerCase())) ||
      (professional.profession && professional.profession.toLowerCase().includes(query.toLowerCase())) ||
      (professional.title && professional.title.toLowerCase().includes(query.toLowerCase())) ||
      (professional.consultationFee && professional.consultationFee <= parseInt(filter)) ||
      (selectedSpecialty !== 'all' && professional.profession && professional.profession.toLowerCase().includes(selectedSpecialty.toLowerCase()))
    );

    setFilteredProfessionals(professionals);
    setFilteredClinics(filtered);
    console.log('Filtered Professionals:', professionals);
    console.log('Filtered Clinics:', filtered);
  };

  const extractClinicImages = (clinic) => {
    const images = clinic.professionals.flatMap(professional => professional.clinic_images.flatMap(image => image.urls));
    return images.length > 0 ? images[0] : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search"
            clearButtonMode="always"
            style={styles.searchBox}
            autoCapitalize="none"
            autoCorrect={false}
            value={searchQuery}
            onChangeText={(query) => handleSearch(query)}
          />
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <Ionicons name="filter" size={24} color="black" style={styles.filterIcon} />
          </TouchableOpacity>
        </View>
      </View>
      {showDropdown && (
        <Picker
          selectedValue={specialty}
          style={styles.picker}
          onValueChange={(itemValue) => {
            setSpecialty(itemValue);
            setShowDropdown(false);
          }}
        >
          {specialties.map((spec) => (
            <Picker.Item key={spec} label={spec} value={spec} />
          ))}
        </Picker>
      )}
      <View style={styles.selectedCategoriesContainer}>
        {selectedCategories.map((category) => (
          <Text key={category} style={styles.selectedCategory}>
            {category}
          </Text>
        ))}
      </View>
      <>
        <Text style={styles.sectionTitle}>Professionals</Text>
        <FlatList
          data={filteredProfessionals}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.user.profileImage }} style={styles.profileImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.cardSubtitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>Fee: {item.consultationFee}</Text>
              </View>
            </View>
          )}
        />
        <Text style={styles.sectionTitle}>Clinics</Text>
        <FlatList
          data={filteredClinics}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: extractClinicImages(item) }} style={styles.clinicImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.address}</Text>
                <Text style={styles.cardSubtitle}>Contact: {item.contactInfo}</Text>
              </View>
            </View>
          )}
        />
      </>
    </SafeAreaView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  filterIcon: {
    marginLeft: 10,
  },
  picker: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  selectedCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  selectedCategory: {
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  clinicImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});