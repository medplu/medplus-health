import { StyleSheet, Text, View, TextInput, ScrollView } from 'react-native'; 
import React, { useState, useRef, useCallback } from 'react';
import { Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import PhoneInput from 'react-native-phone-input';
import Colors from '@/components/Shared/Colors';

const insuranceCompanies = [
  { label: 'AAR Insurance', value: 'aar' },
  { label: 'Jubilee Insurance', value: 'jubilee' },
  { label: 'Britam', value: 'britam' },
];

const specialties = [
  { label: 'Cardiology', value: 'cardiology' },
  { label: 'Dermatology', value: 'dermatology' },
  { label: 'Neurology', value: 'neurology' },
];

const languages = [
  { label: 'English', value: 'english' },
  { label: 'Spanish', value: 'spanish' },
  { label: 'French', value: 'french' },
];

const ClinicInfo = ({ prevStep, nextStep, clinicData, onClinicDataChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const phoneInput = useRef<PhoneInput>(null);
  const assistantPhoneInput = useRef<PhoneInput>(null);

  const handleChange = (key, value) => {
    const updatedData = { ...clinicData, [key]: value };
    console.log('Updated Clinic Data:', updatedData);
    onClinicDataChange(updatedData);
  };

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const assetsArray = Array.isArray(result.assets) ? result.assets : [result.assets].filter(Boolean);
      const uploadedImages = await Promise.all(
        assetsArray.map(async (image) => {
          const secureUrl = await uploadImageToCloudinary(image.uri);
          return { uri: secureUrl };
        })
      );

      console.log('Uploaded Images:', uploadedImages);
      handleChange('images', uploadedImages);
    }
    setIsUploading(false);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Clinic Information</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Name and Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Clinic Name"
          value={clinicData.name || ''}
          onChangeText={(text) => handleChange('name', text)}
        />
        <PhoneInput
          ref={phoneInput}
          style={styles.phoneInput}
          value={clinicData.contactInfo || ''}
          initialCountry="ke"
          onChangePhoneNumber={(number) => handleChange('contactInfo', number)}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={clinicData.address || ''}
          onChangeText={(text) => handleChange('address', text)}
        />
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.rowItem}>
          <Text style={styles.sectionTitle}>Insurance</Text>
          <Picker
            selectedValue={clinicData.insuranceCompanies || ''}
            onValueChange={(value) => handleChange('insuranceCompanies', value)}
            style={styles.input}
            mode="dropdown"
          >
            {insuranceCompanies.map((company) => (
              <Picker.Item key={company.value} label={company.label} value={company.value} />
            ))}
          </Picker>
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <Picker
            selectedValue={clinicData.specialties || ''}
            onValueChange={(value) => handleChange('specialties', value)}
            style={styles.input}
            mode="dropdown"
          >
            {specialties.map((specialty) => (
              <Picker.Item key={specialty.value} label={specialty.label} value={specialty.value} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assistant</Text>
        <TextInput
          style={styles.input}
          placeholder="Assistant Name"
          value={clinicData.assistantName || ''}
          onChangeText={(text) => handleChange('assistantName', text)}
        />
        <PhoneInput
          ref={assistantPhoneInput}
          style={styles.phoneInput}
          value={clinicData.assistantPhone || ''}
          initialCountry="ke"
          onChangePhoneNumber={(number) => handleChange('assistantPhone', number)}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages</Text>
        <Picker
          selectedValue={clinicData.languages || ''}
          onValueChange={(value) => handleChange('languages', value)}
          style={styles.input}
          mode="dropdown"
        >
          {languages.map((language) => (
            <Picker.Item key={language.value} label={language.label} value={language.value} />
          ))}
        </Picker>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={clinicData.bio || ''}
          onChangeText={(text) => handleChange('bio', text)}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Images</Text>
        <Button mode="contained" onPress={pickImage} style={styles.button}>Upload Images</Button>
      </View>
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={prevStep} style={styles.button}>Back</Button>
        <Button mode="contained" onPress={nextStep} style={styles.button} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Next'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default ClinicInfo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.ligh_gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 16,
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    width: '100%',
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
});
