import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  Modal,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';

const UserSettingsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    emailNotifications: false,
    pushNotifications: false,
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedEmailNotifications = await AsyncStorage.getItem('emailNotifications');
        const storedPushNotifications = await AsyncStorage.getItem('pushNotifications');

        setUserId(storedUserId);

        setForm((prevForm) => ({
          ...prevForm,
          email: storedEmail || prevForm.email,
          emailNotifications: storedEmailNotifications ? JSON.parse(storedEmailNotifications) : prevForm.emailNotifications,
          pushNotifications: storedPushNotifications ? JSON.parse(storedPushNotifications) : prevForm.pushNotifications,
        }));

        if (storedUserId) {
          fetchProfile(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
      }
    };

    fetchUserData();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/users/${userId}`);
      const profile = response.data;
      setForm((prevForm) => ({
        ...prevForm,
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile.profileImage,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileChange = async (key, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));

    if (key === 'emailNotifications' || key === 'pushNotifications' || key === 'email') {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const localUri = result.assets[0].uri;
      handleProfileChange('profileImage', localUri);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await axios.put(`https://medplus-health.onrender.com/api/users/update-profile/${userId}`, form);
      console.log('Profile updated successfully:', response.data);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      // Navigate to login screen or perform any other logout actions
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBody}>
            <View style={styles.profile}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: form.profileImage || 'https://via.placeholder.com/150' }}
                  style={styles.profileAvatar} />
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={() => setModalVisible(true)}>
                  <FeatherIcon color="#fff" name="edit" size={16} />
                </TouchableOpacity>
              </View>
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{form.firstName} {form.lastName}</Text>
                <Text style={styles.profileHandle}>{form.email}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionBody}>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email Notifications</Text>
                <Switch
                  onValueChange={(value) => handleProfileChange('emailNotifications', value)}
                  value={form.emailNotifications}
                />
              </View>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Switch
                  onValueChange={(value) => handleProfileChange('pushNotifications', value)}
                  value={form.pushNotifications}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logout</Text>
          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Update Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(text) => handleProfileChange('firstName', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(text) => handleProfileChange('lastName', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => handleProfileChange('email', text)}
            />
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Text style={styles.buttonText}>Choose Profile Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#bcbcbc',
    borderWidth: 2,
  },
  editIconContainer: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 4,
  },
  profileBody: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHandle: {
    color: '#666',
  },
  sectionBody: {
    marginTop: 8,
  },
  rowWrapper: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 12,
  },
  input: {
    height: 40,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  imageButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});

export default UserSettingsScreen;
