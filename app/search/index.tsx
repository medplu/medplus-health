import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Text,
  Image
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { selectAllClinics } from '../store/clinicSlice';
import { Picker } from '@react-native-picker/picker';

const ClinicSearch = () => {
  const navigation = useNavigation();
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(true);
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
  const [showInsurancePicker, setShowInsurancePicker] = useState(false);

  const clinics = useSelector(selectAllClinics);

  useEffect(() => {
    if (clinics.length > 0) {
      console.log('Clinics Data:', clinics); // Log clinics data
      setFilteredClinics(clinics);
      const allProfessionals = clinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies, // Attach insurances to professionals
        })) || []
      );
      setFilteredProfessionals(allProfessionals);
      console.log('All Professionals:', allProfessionals); // Log all professionals
    }
  }, [clinics]);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setSelectedSpecialty('');
    setSelectedInsurance('');
    setShowLocationPicker(false);
    setShowSpecialtyPicker(true);
    setShowInsurancePicker(false);

    const locationFilteredClinics = clinics.filter((clinic) =>
      clinic.address?.toLowerCase().includes(location.toLowerCase())
    );
    const locationFilteredProfessionals = locationFilteredClinics.flatMap(
      (clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies, // Attach insurances to professionals
        })) || []
    );
    setFilteredClinics(locationFilteredClinics);
    setFilteredProfessionals(locationFilteredProfessionals);
    console.log('Filtered Clinics by Location:', locationFilteredClinics); // Log filtered clinics by location
    console.log('Filtered Professionals by Location:', locationFilteredProfessionals); // Log filtered professionals by location
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialty(specialty);
    setSelectedInsurance('');
    setShowSpecialtyPicker(false);
    setShowInsurancePicker(true);

    const specialtyFilteredProfessionals = filteredProfessionals.filter(
      (professional) =>
        professional.title?.toLowerCase().includes(specialty.toLowerCase())
    );
    setFilteredProfessionals(specialtyFilteredProfessionals);
    console.log('Filtered Professionals by Specialty:', specialtyFilteredProfessionals); // Log filtered professionals by specialty
  };

  const handleInsuranceChange = (insurance) => {
    setSelectedInsurance(insurance);
    setShowInsurancePicker(false);

    const insuranceFilteredProfessionals = filteredClinics
      .filter((clinic) =>
        clinic.insuranceCompanies?.some((provider) =>
          provider?.toLowerCase().includes(insurance.toLowerCase())
        )
      )
      .flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies, // Attach insurances to professionals
        })) || []
      );
    setFilteredProfessionals(insuranceFilteredProfessionals);
    console.log('Filtered Professionals by Insurance:', insuranceFilteredProfessionals); // Log filtered professionals by insurance
  };

  // Extract unique values for dropdowns
  const uniqueLocations = [
    ...new Set(clinics.map((clinic) => clinic.address?.split(',')[0] || '')),
  ];
  const uniqueSpecialties = [
    ...new Set(
      clinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => professional.specialty) || []
      )
    ),
  ];
  const uniqueInsurances = [
    ...new Set(
      filteredProfessionals.flatMap((professional) => professional.clinicInsurances || [])
    ),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          editable={false}
        />
      </View>

     
      {showLocationPicker && (
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setShowLocationPicker(true)}>
            <Text>Select Location</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={(value) => handleLocationChange(value)}
          >
            <Picker.Item label="Select a location" value="" />
            {uniqueLocations.map((location, index) => (
              <Picker.Item key={index} label={location} value={location} />
            ))}
          </Picker>
        </View>
      )}

      {/* Specialty Filter */}
      {showSpecialtyPicker && selectedLocation && (
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setShowSpecialtyPicker(true)}>
            <Text>Select Specialty</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedSpecialty}
            onValueChange={(value) => handleSpecialtyChange(value)}
          >
            <Picker.Item label="Select a specialty" value="" />
            {uniqueSpecialties.map((specialty, index) => (
              <Picker.Item key={index} label={specialty} value={specialty} />
            ))}
          </Picker>
        </View>
      )}

     
      {showInsurancePicker && selectedSpecialty && (
        <View style={styles.filterContainer}>
          <TouchableOpacity onPress={() => setShowInsurancePicker(true)}>
            <Text>Select Insurance Provider</Text>
          </TouchableOpacity>
          <Picker
            selectedValue={selectedInsurance}
            onValueChange={(value) => handleInsuranceChange(value)}
          >
            <Picker.Item label="Select an insurance provider" value="" />
            {uniqueInsurances.length > 0 ? (
              uniqueInsurances.map((insurance, index) => (
                <Picker.Item key={index} label={insurance} value={insurance} />
              ))
            ) : (
              <Picker.Item label="No insurance available" value="" />
            )}
          </Picker>
        </View>
      )}

    
      <FlatList
        data={filteredProfessionals}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.professionalCard}>
            {item.profileImage ? (
              <Image
                source={{ uri: item.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person-circle" size={40} color="#ccc" />
            )}
            <View>
              <Text style={styles.professionalInfo}>
                {`${item.firstName} ${item.lastName}`}
              </Text>
              <Text style={styles.clinicInfo}>
                {item.clinicName}, {item.clinicAddress}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ClinicSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  searchBox: {
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  filterContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  professionalInfo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clinicInfo: {
    fontSize: 14,
    color: '#777',
  },
});
