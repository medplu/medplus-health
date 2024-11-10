import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import SSLight from '../../assets/fonts/SourceSansPro/SourceSans3-Light.ttf';
import SSRegular from '../../assets/fonts/SourceSansPro/SourceSans3-Regular.ttf';
import SSBold from '../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUserProfile } from '../store/userSlice';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ProfileScreen() {
  const [loaded] = useFonts({ SSLight, SSRegular, SSBold });
  const dispatch = useDispatch();

  // Access user state from Redux
  const user = useSelector(selectUser);
  const { name, email, profileImage, userId } = user; // Extract userId from Redux state

  const [form, setForm] = useState({
    firstName: name?.split(' ')[0] || '',
    lastName: name?.split(' ')[1] || '',
    profileImage: profileImage || '',
    email: email || '',
  });

  useEffect(() => {
    if (user) {
      // Sync form state with Redux user data if it changes
      setForm({
        firstName: name?.split(' ')[0] || '',
        lastName: name?.split(' ')[1] || '',
        profileImage: profileImage || '',
        email: email || '',
      });
    }
  }, [user]);

  const handleInputChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  // Function to upload image to the backend
  const uploadImageToBackend = async (uri) => {
    const formData = new FormData();
    const fileName = uri.split('/').pop();
    const fileType = uri.split('.').pop();

    formData.append('file', {
      uri,
      name: fileName,
      type: `image/${fileType}`,
    });

    try {
      const response = await axios.post('https://medplus-health.onrender.com/api/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.imageUrl; // Assuming the response contains the URL of the uploaded image
    } catch (error) {
      console.error('Error uploading image:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to upload image');
      return null;
    }
  };

  // Function to handle image picking with compression and resizing
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setForm((prevForm) => ({ ...prevForm, profileImage: result.assets[0].uri })); // Accessing the uri from the assets array
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      if (form.profileImage) {
        const uriParts = form.profileImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('profileImage', {
          uri: form.profileImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any); // TypeScript workaround for FormData
      }

      const response = await axios.put(
        `https://medplus-app.onrender.com/api/users/update-profile/${userId}`, // Use userId for the request
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        dispatch(updateUserProfile({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          profileImage: response.data.user.profileImage, // Use the updated profileImage URL from the response
        }));
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image style={styles.coverImage} source={{ uri: 'https://picsum.photos/500/500?random=211' }} />
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source={{ uri: form.profileImage || 'https://www.bootdey.com/img/Content/avatar/avatar3.png' }}
            />
            <TouchableOpacity style={styles.changeAvatarButton} onPress={pickImage}>
              <Text style={styles.changeAvatarButtonText}>Change profile</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nameAndBioView}>
            <Text style={styles.userFullName}>{`${form.firstName} ${form.lastName}`}</Text>
            <Text style={styles.userBio}>{form.email}</Text>
          </View>
          <View style={styles.formView}>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Profile Image URL (optional)"
              value={form.profileImage}
              editable={false} // Prevent manual editing since it's set by picking an image
            />
            <Button title="Update Profile" onPress={handleUpdateProfile} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  coverImage: { height: 300, width: '100%' },
  profileContainer: {
    backgroundColor: '#fff',
    marginTop: -100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  avatarContainer: { marginTop: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  changeAvatarButton: { marginTop: 10 },
  changeAvatarButtonText: { color: '#1E90FF', fontSize: 18 },
  nameAndBioView: { alignItems: 'center', marginTop: 10 },
  userFullName: { fontFamily: 'SSBold', fontSize: 26 },
  userBio: { fontFamily: 'SSRegular', fontSize: 18, color: '#333', marginTop: 4 },
  formView: { paddingHorizontal: 20, marginTop: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 10 },
});
