<!--public -->
[17:01, 02/10/2024] Medplus Health Network: pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0




<!-- test secret -->
[17:02, 02/10/2024] Medplus Health Network: sk_test_bd491bc07f705e9724f50d3d7b059de890e06716

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    category: '',
    yearsOfExperience: '',
    certifications: '',
    bio: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null); // State to hold user ID

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
      // Fetch user data and set initial form values
      // Example fetch call to get initial user data
      // const userData = await fetchUserDataById(storedUserId);
      // setForm(userData);
    };

    fetchUserData();
  }, []);

  const handleProfileChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`https://medplus-app.onrender.com/api/professionals/update-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          category: form.category,
          yearsOfExperience: form.yearsOfExperience,
          certifications: form.certifications,
          bio: form.bio,
          profileImage: profileImage, // Include the profile image here
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      setModalVisible(false); // Close modal on success
      // Optionally, update local state or AsyncStorage here
    } catch (error) {
      console.error('Error updating profile:', error);
      // Optionally show an alert or toast message to the user
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerAction}>
            <FeatherIcon name="edit" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.sectionLabel}>{form.firstName} {form.lastName}</Text>
            <Text style={styles.sectionLabel}>{form.email}</Text>
          </View>
        </View>

        {/* Modal for Updating Profile */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Update Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={form.firstName}
              onChangeText={(text) => handleProfileChange('firstName', text)} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={form.lastName}
              onChangeText={(text) => handleProfileChange('lastName', text)} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => handleProfileChange('email', text)} />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={form.category}
              onChangeText={(text) => handleProfileChange('category', text)} />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              value={form.yearsOfExperience}
              onChangeText={(text) => handleProfileChange('yearsOfExperience', text)} />
            <TextInput
              style={styles.input}
              placeholder="Certifications"
              value={form.certifications}
              onChangeText={(text) => handleProfileChange('certifications', text)} />
            <TextInput
              style={styles.input}
              placeholder="Bio"
              value={form.bio}
              onChangeText={(text) => handleProfileChange('bio', text)} />

            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Text style={styles.buttonText}>Choose Profile Image</Text>
            </TouchableOpacity>

            {/* Image Preview */}
            {profileImage && (
              <Image
                source={{ uri: profileImage }}
                style={styles.imagePreview}
              />
            )}

            <TouchableOpacity
              style={styles.updateButton}
              onPress={updateProfile}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerAction: {
    justifyContent: 'center',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionBody: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  imageButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});

export default SettingsScreen;
