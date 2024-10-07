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
  Dimensions,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import SSLight from '../../assets/fonts/SourceSansPro/SourceSans3-Light.ttf';
import SSRegular from '../../assets/fonts/SourceSansPro/SourceSans3-Regular.ttf';
import SSBold from '../../assets/fonts/SourceSansPro/SourceSans3-Bold.ttf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ProfileScreen() {
  const [loaded] = useFonts({
    SSLight,
    SSRegular,
    SSBold,
  });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    profileImage: '',
    gender: '',
    email: '',
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (id) {
        setUserId(id);
        fetchUserProfile(id);
      } else {
        Alert.alert('Error', 'User ID not found');
      }
    };

    const fetchUserProfile = async (id: string) => {
      try {
        const response = await axios.get(`http://localhost:3000/api/users/${id}`);
        if (response.status === 200) {
          const { firstName, lastName, profileImage, gender, email } = response.data.user;
          setForm({ firstName, lastName, profileImage, gender, email });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user profile');
      }
    };

    fetchUserId();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/users/update-profile/${userId}`, form);
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <>
          <View>
            <Image
              style={styles.coverImage}
              source={{ uri: 'https://picsum.photos/500/500?random=211' }}
            />
          </View>
          <View style={styles.profileContainer}>
            {/* Profile Details */}
            <View>
              {/* Profile Image */}
              <View style={styles.profileImageView}>
                <Image
                  style={styles.profileImage}
                  source={{
                    uri: form.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg',
                  }}
                />
              </View>
              {/* Profile Name and Bio */}
              <View style={styles.nameAndBioView}>
                <Text style={styles.userFullName}>{`${form.firstName} ${form.lastName}`}</Text>
                <Text style={styles.userBio}>{form.email}</Text>
              </View>
              {/* Profile Form */}
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
                <TextInput
                  style={styles.input}
                  placeholder="Gender"
                  value={form.gender}
                  onChangeText={(value) => handleInputChange('gender', value)}
                />
                <Button title="Update Profile" onPress={handleUpdateProfile} />
              </View>
            </View>
          </View>
        </>
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
  profileImageView: { alignItems: 'center', marginTop: -50 },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameAndBioView: { alignItems: 'center', marginTop: 10 },
  userFullName: { fontFamily: 'SSBold', fontSize: 26 },
  userBio: {
    fontFamily: 'SSRegular',
    fontSize: 18,
    color: '#333',
    marginTop: 4,
  },
  formView: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});