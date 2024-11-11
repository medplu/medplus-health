import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const userId = user.userId;

  const [name, setName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [contactInfo, setContactInfo] = useState<string>(user.contactInfo || '');
  const [image, setImage] = useState<string | null>(user.profileImage || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resizeImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 800 } },
    ]);
    return result.uri;
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

    if (!result.canceled && result.assets) {
      const resizedUri = await resizeImage(result.assets[0].uri);
      setImage(resizedUri);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    const data = new FormData();
    const response = await fetch(imageUri);
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

  const handleSubmit = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let imageUrl = image;
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const profileData = {
        name,
        email,
        contactInfo,
        profileImage: imageUrl,
      };

      const response = await axios.put(
        `https://medplus-app.onrender.com/api/users/update-profile/${userId}`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Profile updated:', response.data);
      navigation.goBack();
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Update Profile</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Info"
        value={contactInfo}
        onChangeText={setContactInfo}
      />
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}
      <Button title={uploading ? "Updating..." : "Update Profile"} onPress={handleSubmit} disabled={uploading} />
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ProfileScreen;
