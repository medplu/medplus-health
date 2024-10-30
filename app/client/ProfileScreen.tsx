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
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import SSLight from '../../assets/fonts/SourceSansPro/SourceSans3-Light.ttf';
import SSRegular from '../../assets/fonts/SourceSansPro/SourceSans3-Regular.ttf';
import SSBold from '../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUserProfile } from '../store/userSlice';

export default function ProfileScreen() {
  const [loaded] = useFonts({ SSLight, SSRegular, SSBold });
  const dispatch = useDispatch();

  // Access user state from Redux
  const user = useSelector(selectUser);
  const { name, email, profileImage } = user;

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

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(`https://medplus-app.onrender.com/api/users/update-profile/${user.userId}`, form);
      if (response.status === 200) {
        // Dispatch updateUserProfile action to update Redux store
        dispatch(updateUserProfile({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          profileImage: form.profileImage,
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
            <Image style={styles.avatar} source={{ uri: form.profileImage || 'https://www.bootdey.com/img/Content/avatar/avatar3.png' }} />
            <TouchableOpacity style={styles.changeAvatarButton} onPress={() => {/* open image picker */}}>
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
              placeholder="Profile Image URL"
              value={form.profileImage}
              onChangeText={(value) => handleInputChange('profileImage', value)}
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
