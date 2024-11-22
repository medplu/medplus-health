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
  Alert,
  ToastAndroid,
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
  const [isUploading, setIsUploading] = useState(false);
  const [isGalleryDisabled, setIsGalleryDisabled] = useState(false);
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

  const uploadImagesToBackend = async (assets) => {
    const formData = new FormData();
   
  
    for (const asset of assets) {
      let imageUri = asset.uri;
  
      if (imageUri.startsWith('data:image')) {
        const base64Data = imageUri.split(',')[1];
        const path = `${FileSystem.cacheDirectory}myImage-${Date.now()}.jpg`;
        await FileSystem.writeAsStringAsync(path, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        imageUri = path;
      }
  
      const image = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `myImage-${Date.now()}.jpg`,
      };
      formData.append('files', image);
    }
  
    try {
      const response = await fetch('https://medplus-health.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      setIsUploading(true);
      try {
        await uploadImagesToBackend(result.assets);
        setIsGalleryDisabled(true); 
        ToastAndroid.show('Images uploaded successfully!', ToastAndroid.SHORT);
      } catch (error) {
        console.error('Error uploading images:', error);
        Alert.alert('Error', 'An error occurred while uploading images');
      } finally {
        setIsUploading(false);
      }
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
            <TouchableOpacity onPress={pickImage} style={styles.iconButton} disabled={isGalleryDisabled}>
              <FeatherIcon name="camera" size={24} color={isGalleryDisabled ? "#ccc" : "#007bff"} />
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
