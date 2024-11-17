import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native'; 
import React, { useState, useRef, useCallback } from 'react';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import PhoneInput from 'react-native-phone-input';
import Colors from '@/components/Shared/Colors';
import { Picker } from '@react-native-picker/picker';

const insuranceCompanies = [
  { label: 'AAR Insurance', value: 'aar' },
  { label: 'Jubilee Insurance', value: 'jubilee' },
  { label: 'Britam', value: 'britam' },
  { label: 'UAP Old Mutual', value: 'uap' },
  { label: 'CIC Insurance', value: 'cic' },
];

const specialties = [
  { label: 'Cardiology', value: 'cardiology' },
  { label: 'Dermatology', value: 'dermatology' },
  { label: 'Neurology', value: 'neurology' },
  { label: 'Pediatrics', value: 'pediatrics' },
  { label: 'Orthopedics', value: 'orthopedics' },
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

  const pickFromGallery = async () => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (granted) {
      let data = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        allowsMultipleSelection: true,
      });
      if (!data.canceled) {
        const assetsArray = Array.isArray(data.assets) ? data.assets : [data.assets].filter(Boolean);
        const uploadedImages = await Promise.all(
          assetsArray.map(async (image) => {
            const newFile = {
              uri: image.uri,
              type: `test/${image.uri.split('.').pop()}`,
              name: `test.${image.uri.split('.').pop()}`,
            };
            const secureUrl = await handleUpload(newFile);
            return { uri: secureUrl };
          })
        );
        console.log('Uploaded Images:', uploadedImages);
        handleChange('images', uploadedImages);
      }
    } else {
      Alert.alert('You need to grant permission to access the gallery.');
    }
  };

  const pickFromCamera = async () => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA);
    if (granted) {
      let data = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!data.canceled) {
        const newFile = {
          uri: data.uri,
          type: `test/${data.uri.split('.').pop()}`,
          name: `test.${data.uri.split('.').pop()}`,
        };
        const secureUrl = await handleUpload(newFile);
        handleChange('images', [{ uri: secureUrl }]);
      }
    } else {
      Alert.alert('You need to grant permission to access the camera.');
    }
  };

  const handleUpload = async (image) => {
    const data = new FormData();
    data.append('file', image);
    data.append('upload_preset', 'medplus');
    data.append('cloud_name', 'dws2bgxg4');
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      console.log('Cloudinary Upload Response:', result);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insurance</Text>
        <FlatList
          data={insuranceCompanies}
          renderItem={({ item, index }) => renderCard(item, clinicData.insuranceCompanies || [], (selectedItems) => handleChange('insuranceCompanies', selectedItems), index)}
          keyExtractor={(item) => item.value}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
      <View style={styles.section}>
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
        <View style={styles.modalButtonWrapper}>
          <Button mode="contained" onPress={pickFromCamera} style={styles.button}>Camera</Button>
          <Button mode="contained" onPress={pickFromGallery} style={styles.button}>Gallery</Button>
        </View>
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
  card: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  cardSelected: {
    borderColor: Colors.primary,
  },
  cardText: {
    color: '#333',
  },
  flatListContainer: {
    paddingVertical: 10,
  },
  modalButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
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
