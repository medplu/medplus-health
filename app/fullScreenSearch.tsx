import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const FullScreenSearch = ({ searchResults, initialSpecialty }) => {
  const [filteredResults, setFilteredResults] = useState(searchResults);
  const [searchQuery, setSearchQuery] = useState(initialSpecialty);
  const [searchType, setSearchType] = useState('all'); // State to track search type

  useEffect(() => {
    filterResults(initialSpecialty);
  }, [searchResults, initialSpecialty]);

  const filterResults = (query) => {
    let filteredClinics = searchResults.clinics;
    let filteredProfessionals = searchResults.professionals;

    if (query) {
      filteredClinics = searchResults.clinics.filter(clinic =>
        clinic.specialties.toLowerCase().includes(query.toLowerCase())
      );
      filteredProfessionals = searchResults.professionals.filter(professional =>
        professional.specialty.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredResults({
      clinics: filteredClinics,
      professionals: filteredProfessionals,
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterResults(query);
  };

  const renderClinic = ({ item }) => (
    <View style={styles.clinicContainer}>
      <Text style={styles.clinicName}>{item.name}</Text>
      <Text style={styles.clinicContact}>{item.contactInfo}</Text>
      <Text style={styles.clinicAddress}>{item.address}</Text>
      <Text style={styles.clinicSpecialties}>Specialties: {item.specialties}</Text>
      <Text style={styles.clinicBio}>{item.bio}</Text>
      <Text style={styles.clinicAssistant}>Assistant: {item.assistantName} ({item.assistantPhone})</Text>
      <Text style={styles.clinicEducation}>Education: {item.education.course} from {item.education.university}</Text>
      <Text style={styles.clinicLanguages}>Languages: {item.languages}</Text>
      <Text style={styles.clinicInsurance}>Insurance Companies: {item.insuranceCompanies.join(', ')}</Text>
      <Text style={styles.clinicProfessionals}>Professionals:</Text>
      {item.professionals.map(professional => (
        <View key={professional._id} style={styles.professionalContainer}>
          <Text style={styles.professionalName}>{professional.firstName} {professional.lastName}</Text>
          <Text style={styles.professionalSpecialty}>Specialty: {professional.specialty}</Text>
          <Text style={styles.professionalContact}>Contact: {professional.contactInfo}</Text>
          <Text style={styles.professionalBio}>{professional.bio}</Text>
        </View>
      ))}
    </View>
  );

  const renderDoctor = ({ item }) => (
    <View style={styles.doctorContainer}>
      <Text style={styles.doctorName}>{item.firstName} {item.lastName}</Text>
      <Text style={styles.doctorSpecialty}>Specialty: {item.specialty}</Text>
      <Text style={styles.doctorContact}>Contact: {item.contactInfo}</Text>
      <Text style={styles.doctorBio}>{item.bio}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by specialty"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={searchType === 'all' ? styles.filterButtonActive : styles.filterButton}
          onPress={() => setSearchType('all')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={searchType === 'clinics' ? styles.filterButtonActive : styles.filterButton}
          onPress={() => setSearchType('clinics')}
        >
          <Text style={styles.filterButtonText}>Clinics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={searchType === 'professionals' ? styles.filterButtonActive : styles.filterButton}
          onPress={() => setSearchType('professionals')}
        >
          <Text style={styles.filterButtonText}>Professionals</Text>
        </TouchableOpacity>
      </View>
      {searchType === 'all' || searchType === 'clinics' ? (
        <FlatList
          data={filteredResults.clinics}
          renderItem={renderClinic}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : null}
      {searchType === 'all' || searchType === 'professionals' ? (
        <FlatList
          data={filteredResults.professionals}
          renderItem={renderDoctor}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#007bff',
    marginHorizontal: 5,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  clinicContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clinicContact: {
    fontSize: 16,
    marginTop: 5,
  },
  clinicAddress: {
    fontSize: 16,
    marginTop: 5,
  },
  clinicSpecialties: {
    fontSize: 16,
    marginTop: 5,
  },
  clinicBio: {
    fontSize: 14,
    marginTop: 5,
  },
  clinicAssistant: {
    fontSize: 14,
    marginTop: 5,
  },
  clinicEducation: {
    fontSize: 14,
    marginTop: 5,
  },
  clinicLanguages: {
    fontSize: 14,
    marginTop: 5,
  },
  clinicInsurance: {
    fontSize: 14,
    marginTop: 5,
  },
  clinicProfessionals: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  professionalContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  professionalSpecialty: {
    fontSize: 14,
    marginTop: 5,
  },
  professionalContact: {
    fontSize: 14,
    marginTop: 5,
  },
  professionalBio: {
    fontSize: 14,
    marginTop: 5,
  },
  doctorContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doctorSpecialty: {
    fontSize: 16,
    marginTop: 5,
  },
  doctorContact: {
    fontSize: 16,
    marginTop: 5,
  },
  doctorBio: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default FullScreenSearch;
