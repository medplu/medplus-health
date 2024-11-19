import React, { useState } from 'react';
import { ScrollView, Text, View, Alert, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Collapsible from 'react-native-collapsible';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice'; 

const insuranceCompanies = [
  { label: 'AAR Insurance', value: 'aar' },
  { label: 'Jubilee Insurance', value: 'jubilee' },
  { label: 'Britam', value: 'britam' },
  { label: 'UAP Old Mutual', value: 'uap' },
  { label: 'CIC Insurance', value: 'cic' },
];

const RegistrationForm = () => {
  const user = useSelector(selectUser);
  const professionalId = user?.professional?._id;

  const [formData, setFormData] = useState({
    pharmacyName: '',
    address: '',
    phone: '',
    ownerName: '',
    ownerEmail: '',
    licenseNumber: '',
    openingTime: '',
    closingTime: '',
    insuranceCompanies: [],
    assistantName: '',
    assistantPhone: ''
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleStepChange = (direction) => {
    if (direction === 'next' && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      pharmacyData: {
        name: formData.pharmacyName,
        contactNumber: formData.phone,
        email: formData.ownerEmail,
        address: {
          street: formData.address,
          city: '', // Add city field if available
          state: '', // Add state field if available
          zipCode: '', // Add zip code field if available
        },
        insuranceCompanies: formData.insuranceCompanies, // Already an array
        specialties: [], // Add specialties if available
        assistantName: formData.assistantName, // Add assistant name if available
        assistantPhone: formData.assistantPhone, // Add assistant phone if available
        images: [], // Add images if available
        operatingHours: {
          open: formData.openingTime,
          close: formData.closingTime,
        },
        licenseNumber: formData.licenseNumber,
        services: [] // Removed services field
      }
    };

    try {
      console.log('Pharmacy Data before submission:', payload.pharmacyData);
      const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.pharmacyData.name,
          contactNumber: payload.pharmacyData.contactNumber,
          email: payload.pharmacyData.email,
          address: {
            street: payload.pharmacyData.address.street,
            city: payload.pharmacyData.address.city,
            state: payload.pharmacyData.address.state,
            zipCode: payload.pharmacyData.address.zipCode,
          },
          insuranceCompanies: payload.pharmacyData.insuranceCompanies,
          specialties: payload.pharmacyData.specialties,
          assistantName: payload.pharmacyData.assistantName,
          assistantPhone: payload.pharmacyData.assistantPhone,
          images: payload.pharmacyData.images || [],
          operatingHours: payload.pharmacyData.operatingHours,
          licenseNumber: payload.pharmacyData.licenseNumber,
          services: payload.pharmacyData.services
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Pharmacy registered successfully:', data);
        Alert.alert('Success', 'Pharmacy registered successfully', [
          { text: 'OK', onPress: () => navigation.navigate('/professional') }
        ]);
        // Reset the form
        setCurrentStep(1);
        setFormData({
          pharmacyName: '',
          address: '',
          phone: '',
          ownerName: '',
          ownerEmail: '',
          licenseNumber: '',
          openingTime: '',
          closingTime: '',
          insuranceCompanies: [],
          assistantName: '',
          assistantPhone: ''
        });
      } else {
        console.error('Error registering pharmacy:', data);
        Alert.alert('Error', 'Error registering pharmacy');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An error occurred');
    }
  };

  const renderCard = (item, selectedItems, onSelect, index) => (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: index % 2 === 0 ? '#f0f8ff' : '#e6f7ff' },
        selectedItems.includes(item.value) && styles.cardSelected,
      ]}
      onPress={() => {
        const newSelectedItems = selectedItems.includes(item.value)
          ? selectedItems.filter((i) => i !== item.value)
          : [...selectedItems, item.value];
        onSelect(newSelectedItems);
      }}
    >
      <Text style={styles.cardText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.stepIndicator}>
        <Text>Step {currentStep} of 3</Text>
      </View>

      {/* Pharmacy Information */}
      <Collapsible collapsed={currentStep !== 1}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pharmacy Information</Text>
          <TextInput
            mode="outlined"
            label="Pharmacy Name"
            placeholder="Enter pharmacy name"
            value={formData.pharmacyName}
            onChangeText={(text) => handleInputChange('pharmacyName', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Address"
            placeholder="Enter address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Phone Number"
            placeholder="e.g., 123-456-7890"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            style={styles.input}
            left={<TextInput.Icon name={() => <Icon name="phone" size={20} />} />}
          />
        </View>
      </Collapsible>

      {/* Owner Information */}
      <Collapsible collapsed={currentStep !== 2}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owner Information</Text>
          <TextInput
            mode="outlined"
            label="Owner Name"
            placeholder="Enter owner's name"
            value={formData.ownerName}
            onChangeText={(text) => handleInputChange('ownerName', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Owner Email"
            placeholder="Enter email address"
            keyboardType="email-address"
            value={formData.ownerEmail}
            onChangeText={(text) => handleInputChange('ownerEmail', text)}
            style={styles.input}
            left={<TextInput.Icon name={() => <Icon name="email" size={20} />} />}
          />
        </View>
      </Collapsible>

      {/* Additional Details */}
      <Collapsible collapsed={currentStep !== 3}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details</Text>
          <TextInput
            mode="outlined"
            label="License Number"
            placeholder="Enter license number"
            value={formData.licenseNumber}
            onChangeText={(text) => handleInputChange('licenseNumber', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Opening Time"
            placeholder="e.g., 08:00 AM"
            value={formData.openingTime}
            onChangeText={(text) => handleInputChange('openingTime', text)}
            style={styles.input}
            left={<TextInput.Icon name={() => <Icon name="access-time" size={20} />} />}
          />
          <TextInput
            mode="outlined"
            label="Closing Time"
            placeholder="e.g., 06:00 PM"
            value={formData.closingTime}
            onChangeText={(text) => handleInputChange('closingTime', text)}
            style={styles.input}
            left={<TextInput.Icon name={() => <Icon name="access-time" size={20} />} />}
          />
          <TextInput
            mode="outlined"
            label="Insurance Companies"
            placeholder="Enter insurance companies (comma separated)"
            value={formData.insuranceCompanies}
            onChangeText={(text) => handleInputChange('insuranceCompanies', text)}
            style={styles.input}
          />
          <FlatList
            data={insuranceCompanies}
            renderItem={({ item, index }) => renderCard(item, formData.insuranceCompanies || [], (selectedItems) => handleInputChange('insuranceCompanies', selectedItems), index)}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />
          <View style={styles.optionalSection}>
            <Text style={styles.optionalSectionTitle}>Assistant Information (Optional)</Text>
            <TextInput
              mode="outlined"
              label="Assistant Name"
              placeholder="Enter assistant name"
              value={formData.assistantName}
              onChangeText={(text) => handleInputChange('assistantName', text)}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Assistant Phone"
              placeholder="Enter assistant phone"
              value={formData.assistantPhone}
              onChangeText={(text) => handleInputChange('assistantPhone', text)}
              style={styles.input}
            />
          </View>
        </View>
      </Collapsible>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {currentStep > 1 && (
          <Button
            mode="contained-tonal"
            onPress={() => handleStepChange('prev')}
            style={styles.button}
          >
            Previous
          </Button>
        )}
        {currentStep < 3 ? (
          <Button
            mode="contained"
            onPress={() => handleStepChange('next')}
            style={styles.button}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Submit
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = {
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  stepIndicator: { marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  input: { marginBottom: 12 },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  button: { width: '48%' },
  submitButton: { width: '100%', backgroundColor: '#007bff' },
  card: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  cardSelected: {
    borderColor: '#007bff',
  },
  cardText: {
    color: '#333',
  },
  flatListContainer: {
    paddingVertical: 10,
  },
  optionalSection: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  optionalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
};

export default RegistrationForm;
