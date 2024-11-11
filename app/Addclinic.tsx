import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from './store/userSlice';

interface AddClinicFormProps {
  onClose: () => void;
}

const AddClinicForm: React.FC<AddClinicFormProps> = ({ onClose }) => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const professionalId = user.professional?._id;
  const [name, setName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

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

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    const data = new FormData();

    const response = await fetch(imageUri);
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
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!professionalId) {
        throw new Error('Professional ID is required to create a clinic');
      }

      setUploading(true);

      let imageUrl = '';
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const formData = {
        name,
        contactInfo,
        address,
        category,
        image: imageUrl,
      };

      console.log('Submitting form with professionalId:', professionalId);

      const response = await axios.post(
        `https://medplus-health.onrender.com/api/clinics/register/${professionalId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Clinic created:', response.data);
      
      if (navigation && typeof navigation.goBack === 'function') {
        navigation.goBack();
      } else {
        console.error('navigation.goBack is not available');
      }
    } catch (error) {
      console.error('Error creating clinic:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Clinic</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Info"
        value={contactInfo}
        onChangeText={setContactInfo}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}
      <Button title={uploading ? "Submitting..." : "Submit"} onPress={handleSubmit} disabled={uploading} />
      <Button title="Cancel" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});

export default AddClinicForm;