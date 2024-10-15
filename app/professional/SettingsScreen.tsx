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
    profileImage: '',
    emailNotifications: false,
    pushNotifications: false,
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
      if (storedUserId) {
        fetchProfile(storedUserId);
      }
    };

    fetchUserData();
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log(`Fetching profile for userId: ${userId}`); // Log the userId
    try {
      const response = await axios.get(`https://medplus-app.onrender.com/api/professionals/${userId}`);
      const profile = response.data;
      setForm((prevForm) => ({
        ...prevForm,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        profileImage: profile.profileImage,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileChange = (key, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleProfileChange('profileImage', result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`https://medplus-app.onrender.com/api/professionals/update-profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      setModalVisible(false);
      fetchProfile(userId); // Fetch updated profile data
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {/* handle back navigation */}}>
          <FeatherIcon color="#000" name="arrow-left" size={24} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => {/* handle more options */}}>
          <FeatherIcon color="#000" name="more-vertical" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionBody}>
            <View style={styles.profile}>
              <View style={styles.profileImageContainer}>
                <Image
                  alt=""
                  source={{
                    uri: form.profileImage || 'https://via.placeholder.com/150',
                  }}
                  style={styles.profileAvatar} />
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={() => setModalVisible(true)}>
                  <FeatherIcon
                    color="#fff"
                    name="edit"
                    size={16} />
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
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Language</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>English</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Location</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>Los Angeles, CA</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email Notifications</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={(value) => handleProfileChange('emailNotifications', value)}
                  value={form.emailNotifications}
                />
              </View>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={(value) => handleProfileChange('pushNotifications', value)}
                  value={form.pushNotifications}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.sectionBody}>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Contact Us</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Report Bug</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Rate in App Store</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.sectionLabel}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}>
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
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
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
  rowValue: {
    color: '#666',
  },
  rowSpacer: {
    flex: 1,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  imageButton: {
    backgroundColor: '#007bff',
    borderRadius: 4,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#28a745',
    borderRadius: 4,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 4,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SettingsScreen;