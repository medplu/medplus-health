import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const FullScreenSearch = ({ searchResults, searchType }) => {
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
    <FlatList
      data={searchResults}
      renderItem={searchType === 'clinics' ? renderClinic : renderDoctor}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
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
