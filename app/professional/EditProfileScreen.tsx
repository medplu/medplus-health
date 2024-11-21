import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Avatar } from 'react-native-paper';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUserProfile } from '../store/userSlice';
import Colors from '@/components/Shared/Colors';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const userId = user.userId;
  const dispatch = useDispatch();

  const [name, setName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [contactInfo, setContactInfo] = useState<string>(user.contactInfo || '');
  const [image, setImage] = useState<string | null>(user.profileImage || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [consultationFee, setConsultationFee] = useState<string>(user.consultationFee || '');

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
        consultationFee,
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
      dispatch(updateUserProfile(profileData)); // Dispatch the action to update Redux state
      navigation.goBack();
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  }, [userId, name, email, contactInfo, image, consultationFee, navigation, dispatch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.ligh_gray }}>

      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <Avatar.Image size={100} source={{ uri: image || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Button mode="contained" onPress={pickImage} style={styles.uploadButton}>
          Pick an image
        </Button>

        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Contact Info"
          value={contactInfo}
          onChangeText={setContactInfo}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Consultation Fee"
          value={consultationFee}
          onChangeText={setConsultationFee}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
        />
        <Button mode="contained" onPress={handleSubmit} loading={uploading} disabled={uploading} style={styles.saveButton}>
          {uploading ? "Updating..." : "Update Profile"}
        </Button>
        {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  headerAction: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  avatar: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default EditProfileScreen;