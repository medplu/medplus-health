import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface Doctor {
  name: string;
  specialties: string;
  experience: string;
}

interface AddClinicFormProps {
  onClose: () => void;
}

const AddClinicForm: React.FC<AddClinicFormProps> = ({ onClose }) => {
  const [name, setName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [category, setCategory] = useState<string>(''); // Add category state
  const [image, setImage] = useState<string | File | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([{ name: '', specialties: '', experience: '' }]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          console.log('User ID fetched from AsyncStorage:', storedUserId); // Debugging log
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user ID from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleAddDoctor = () => {
    setDoctors([...doctors, { name: '', specialties: '', experience: '' }]);
  };

  const handleDoctorChange = (index: number, field: keyof Doctor, value: string) => {
    const newDoctors = [...doctors];
    newDoctors[index][field] = value;
    setDoctors(newDoctors);
  };

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

    if (!result.canceled && 'uri' in result) {
      if (!result.canceled) {
        const successResult = result as ImagePicker.ImagePickerSuccessResult;
        setImage(successResult.uri);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required to create a clinic');
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('contactInfo', contactInfo);
      formData.append('address', address);
      formData.append('category', category); // Include category in form data
      formData.append('doctors', JSON.stringify(doctors)); // Ensure doctors is stringified
      if (image) {
        if (typeof image === 'string') {
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('image', {
            uri: image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any); // TypeScript workaround for FormData
        } else {
          formData.append('image', image);
        }
      }

      console.log('Submitting form with userId:', userId); // Debugging log

      const response = await axios.post(`http://localhost:3000/api/clinics/register/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Clinic created:', response.data);
      onClose();
    } catch (error) {
      console.error('Error creating clinic:', error);
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
      {Platform.OS === 'web' ? (
        <input type="file" accept="image/*" onChange={handleImageChange} />
      ) : (
        <Button title="Pick an image from camera roll" onPress={pickImage} />
      )}
      {image && (
        <Image
          source={{ uri: typeof image === 'string' ? image : URL.createObjectURL(image) }}
          style={styles.image}
        />
      )}
      {doctors.map((doctor, index) => (
        <View key={index} style={styles.doctorContainer}>
          <TextInput
            style={styles.input}
            placeholder="Doctor Name"
            value={doctor.name}
            onChangeText={(value) => handleDoctorChange(index, 'name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Specialties"
            value={doctor.specialties}
            onChangeText={(value) => handleDoctorChange(index, 'specialties', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Experience"
            value={doctor.experience}
            onChangeText={(value) => handleDoctorChange(index, 'experience', value)}
          />
        </View>
      ))}
      <Button title="Add Another Doctor" onPress={handleAddDoctor} />
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Cancel" onPress={onClose} />
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
  doctorContainer: {
    marginBottom: 20,
  },
});

export default AddClinicForm;