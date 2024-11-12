import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from './store/userSlice';
import * as ImageManipulator from 'expo-image-manipulator';

const AddClinicForm: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;

  // State management
  const [step, setStep] = useState(1); // Step state
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);

  const pickImage = async () => {
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
    });
    if (!result.canceled && result.assets) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    data.append('file', blob);
    data.append('upload_preset', 'medplus');
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!professionalId) throw new Error('Professional ID is required');
      setUploading(true);
      let imageUrl = '';
      if (image) imageUrl = await uploadImageToCloudinary(image);

      const formData = { name, contactInfo, address, category, image: imageUrl };
      await axios.post(`https://medplus-health.onrender.com/api/clinics/register/${professionalId}`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccess(true);
      Alert.alert(
        "Success",
        "Clinic created successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setName('');
              setContactInfo('');
              setAddress('');
              setCategory('');
              setImage(null);
              setStep(1);
              // Navigate to professional screen
              navigation.navigate('professional');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error creating clinic:', error);
    } finally {
      setUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Clinic Details</Text>
            <TextInput style={styles.input} placeholder="Clinic Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
            <Button title="Next" onPress={() => setStep(2)} />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Contact Information</Text>
            <TextInput style={styles.input} placeholder="Contact Info" value={contactInfo} onChangeText={setContactInfo} />
            <Button title="Next" onPress={() => setStep(3)} />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Upload Clinic Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Pick an image from camera roll</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <Button title="Next" onPress={() => setStep(4)} />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review and Submit</Text>
            <Text>Clinic Name: {name}</Text>
            <Text>Category: {category}</Text>
            <Text>Address: {address}</Text>
            <Text>Contact Info: {contactInfo}</Text>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={uploading}>
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderStepContent()}
      {step > 1 && <Button title="Back" onPress={() => setStep(step - 1)} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#fff' },
  stepContainer: { marginBottom: 20 },
  stepTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, borderRadius: 5 },
  imagePicker: { backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
  imagePickerText: { color: '#fff', fontSize: 16 },
  image: { width: '100%', height: 200, marginBottom: 10, borderRadius: 5 },
  submitButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16 },
});

export default AddClinicForm;
