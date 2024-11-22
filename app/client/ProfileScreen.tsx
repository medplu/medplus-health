import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Button,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateUserProfile } from '../store/userSlice';
import * as FileSystem from 'expo-file-system';

const ProfileScreen: React.FC = () => {
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

  const resizeImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 800 } },
    ]);
    return result.uri;
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      let imageUri = uri;

      if (imageUri.startsWith('data:image')) {
        const base64Data = imageUri.split(',')[1];
        const path = `${FileSystem.cacheDirectory}profileImage-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(path, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        imageUri = path;
      }

      const fileName = imageUri.split('/').pop() || 'profileImage.jpg';
      const fileType = fileName.split('.').pop() || 'jpeg';

      formData.append('profileImage', {
        uri: imageUri,
        type: `image/${fileType}`,
        name: fileName,
      });

      console.log('FormData payload:', formData);

      const response = await axios.put(
        `https://medplus-health.onrender.com/api/users/update-profile/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Image uploaded successfully:', response.data);
      dispatch(updateUserProfile({ profileImage: response.data.user.profileImage })); // Update Redux store
    } catch (uploadError) {
      console.error('Error uploading image:', uploadError.response || uploadError);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permissions are required!');
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
      setImage(resizedUri); // Optimistic update
      uploadImage(resizedUri); // Upload immediately
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/users/update-profile/${userId}`,
        { name, email, contactInfo },
        { headers: { 'Content-Type': 'application/json' } }
      );

      dispatch(updateUserProfile(response.data.user));
      navigation.goBack();
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  }, [name, email, contactInfo, userId, dispatch, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerAction}>
          <FeatherIcon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.profile}>
            <Image source={{ uri: image || 'default-avatar-uri' }} style={styles.profileAvatar} />
            <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
              <FeatherIcon name="camera" size={24} color="#007bff" />
            </TouchableOpacity>
          </TouchableOpacity>
          {uploading && <ActivityIndicator size="large" color="#007bff" />}
        </View>

        <View style={styles.section}>
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
          <Button
            title={uploading ? 'Updating...' : 'Update Profile'}
            onPress={handleSubmit}
            disabled={uploading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerAction: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  container: { padding: 16 },
  section: { marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  profile: { alignItems: 'center', marginBottom: 16 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  iconButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 20, padding: 5 },
  input: { borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 10 },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 },
});

export default ProfileScreen;
