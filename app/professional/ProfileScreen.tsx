import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  ActivityIndicator,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
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

  const pickImage = useCallback(async () => {
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
  }, []);

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

  const handleSubmit = useCallback(async () => {
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
      // Reset form fields
      setName('');
      setEmail('');
      setContactInfo('');
      setImage(null);
      navigation.goBack();
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  }, [userId, name, email, contactInfo, image, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerAction}>
          <FeatherIcon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
        <TouchableOpacity onPress={() => { /* handle more options */ }} style={styles.headerAction}>
          <FeatherIcon name="more-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.profile}>
            <Image source={{ uri: image || 'default-avatar-uri' }} style={styles.profileAvatar} />
            <View style={styles.profileBody}>
              <Text style={styles.profileName}>{name || 'Full Name'}</Text>
              <Text style={styles.profileHandle}>{email || 'email@example.com'}</Text>
            </View>
            <FeatherIcon name="chevron-right" size={22} color="#bcbcbc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Information</Text>
          <View style={styles.sectionBody}>
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
            <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>Pick an image from camera roll</Text>
            </TouchableOpacity>
           
            <Button title={uploading ? "Updating..." : "Update Profile"} onPress={handleSubmit} disabled={uploading} />
            {uploading && <ActivityIndicator size="large" color="#0000ff" />}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  container: {
    padding: 16,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: '500',
    color: '#a69f9f',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionBody: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
  },
  profileHandle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#858585',
    marginTop: 2,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingLeft: 8,
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
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
