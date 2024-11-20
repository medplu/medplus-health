import React, { useState, useCallback } from 'react';
import { ScrollView, Text, View, Alert, FlatList, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Collapsible from 'react-native-collapsible';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import Toast from 'react-native-toast-message';
import PharmacyInfo from './PharmacyInfo';

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
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
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
  const [image, setImage] = useState<string | null>(null);
  const [pharmacyId, setPharmacyId] = useState<string | null>(null); // New state to store pharmacy ID

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleStepChange = (direction) => {
    if (direction === 'next' && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        pharmacyData: {
          name: formData.pharmacyName,
          contactNumber: formData.phone,
          email: formData.ownerEmail,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
          },
          insuranceCompanies: formData.insuranceCompanies,
          specialties: [],
          assistantName: formData.assistantName,
          assistantPhone: formData.assistantPhone,
          images: [],
          operatingHours: {
            open: formData.openingTime,
            close: formData.closingTime,
          },
          licenseNumber: formData.licenseNumber,
          services: [],
        }
      };

      console.log('Pharmacy Data before submission:', payload.pharmacyData);
      const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/${professionalId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload.pharmacyData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Pharmacy registered successfully:', data);
        setPharmacyId(data.pharmacy._id); // Store the pharmacy ID
        Toast.show({
          type: 'success',
          text1: 'Pharmacy registered successfully',
          text2: 'Proceed to upload an image',
          onPress: () => {
            setCurrentStep(5); // Move to the image handling step
            Toast.hide(); // Hide the toast message
          },
          position: 'bottom',
          autoHide: false,
          bottomOffset: 50,
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

  const handleImageSubmit = async (imageUrl: string) => {
    if (!pharmacyId || !imageUrl) return;

    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/pharmacies/${pharmacyId}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Image uploaded successfully:', data);
        Alert.alert('Success', 'Image uploaded successfully', [
          { text: 'OK', onPress: () => navigation.navigate('pharmacist/tabs') }
        ]);
      } else {
        console.error('Error uploading image:', data);
        Alert.alert('Error', 'Error uploading image');
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
        <Text>Step {currentStep} of 4</Text>
      </View>

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

      <Collapsible collapsed={currentStep !== 2}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Information</Text>
          <TextInput
            mode="outlined"
            label="Street Address"
            placeholder="Enter street address"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="City"
            placeholder="Enter city"
            value={formData.city}
            onChangeText={(text) => handleInputChange('city', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="State"
            placeholder="Enter state"
            value={formData.state}
            onChangeText={(text) => handleInputChange('state', text)}
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Postal Code"
            placeholder="Enter postal code"
            value={formData.postalCode}
            onChangeText={(text) => handleInputChange('postalCode', text)}
            style={styles.input}
          />
        </View>
      </Collapsible>

      <Collapsible collapsed={currentStep !== 3}>
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

      <Collapsible collapsed={currentStep !== 4}>
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

      {currentStep === 5 && (
        <PharmacyInfo pharmacyId={pharmacyId} />
      )}

      <View style={styles.buttonsContainer}>
        {currentStep > 1 && currentStep < 5 && (
          <Button
            mode="contained-tonal"
            onPress={() => handleStepChange('prev')}
            style={styles.button}
          >
            Previous
          </Button>
        )}
        {currentStep < 4 ? (
          <Button
            mode="contained"
            onPress={() => handleStepChange('next')}
            style={styles.button}
          >
            Next
          </Button>
        ) : currentStep === 4 ? (
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Submit
          </Button>
        ) : null}
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
  },
};

export default RegistrationForm;
