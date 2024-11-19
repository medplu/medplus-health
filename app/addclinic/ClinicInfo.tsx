import { StyleSheet, Text, View, TextInput, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native'; 
import React, { useState, useRef, useCallback } from 'react';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import PhoneInput from 'react-native-phone-input';
import Colors from '@/components/Shared/Colors';
import { Picker } from '@react-native-picker/picker';
import * as ImageManipulator from 'expo-image-manipulator';

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
    const updatedData = { 
      ...clinicData, 
      [key]: key === 'images' ? [...(clinicData.images || []), ...value] : value 
    };
    console.log('Updated Clinic Data:', updatedData);
    onClinicDataChange(updatedData);
  };

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true, // Enable multiple selection
    });

    if (!result.canceled && result.assets) {
      setIsUploading(true);
      try {
        const imageUris = await Promise.all(result.assets.map(async (asset) => {
          const resizedUri = await resizeImage(asset.uri);
          const secureUrl = await handleUpload({ uri: resizedUri });
          return { uri: secureUrl };
        }));
        handleChange('images', imageUris);
      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'An error occurred while uploading images');
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setIsUploading(true);
      try {
        const resizedUri = await resizeImage(result.assets[0].uri);
        const secureUrl = await handleUpload({ uri: resizedUri });
        handleChange('images', [{ uri: secureUrl }]);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'An error occurred while uploading the image');
      } finally {
        setIsUploading(false);
      }
    }
  }, []);

  const resizeImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 800 } },
    ]);
    return result.uri;
  };

  const handleUpload = async (image) => {
    const data = new FormData();
    const response = await fetch(image.uri);
    const blob = await response.blob();

    data.append('file', blob);
    data.append('upload_preset', 'medplus');
    data.append('quality', 'auto');
    data.append('fetch_format', 'auto');

    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await uploadResponse.json();
      return result.secure_url;
    } catch (uploadError) {
      console.error('Error uploading image to Cloudinary:', uploadError);
      throw uploadError;
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
          value={clinicData.contactInfo || ''} // Ensure contactInfo is captured
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
