import React, { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
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
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, selectUser } from '../store/userSlice';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const professionalId = user?.professional?._id;

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profession: '',
    certifications: [],
    emailNotifications: false,
    pushNotifications: false,
    clinic: '',
    attachedToClinic: false,
    profileImage: '',
    consultationFee: '',
    availability: [], // Default to an empty array
  });
  
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);

  useEffect(() => {
    if (user?.professional) {
      setForm((prevForm) => ({
        ...prevForm,
        firstName: user.professional.firstName,
        lastName: user.professional.lastName,
        email: user.professional.email,
        profession: user.professional.profession,
        certifications: user.professional.certifications,
        emailNotifications: user.professional.emailNotifications,
        pushNotifications: user.professional.pushNotifications,
        clinic: user.professional.clinic,
        attachedToClinic: user.professional.attachedToClinic,
        profileImage: user.professional.profileImage?.uri || user.professional.profileImage,
        consultationFee: user.professional.consultationFee,
        availability: user.professional.availability || [], // Fallback to empty array
      }));
    }
  }, [user]);
  

  const handleProfileChange = (key, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled) {
      const { uri } = result.assets[0]; // Get the URI directly
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
  
      // Set the form to just the base64 string
      setForm((prevForm) => ({
        ...prevForm,
        profileImage: `data:image/jpeg;base64,${base64Image}`, // Store the string directly
      }));
    }
  };
  

  const updateProfile = async () => {
    if (!professionalId) {
      Alert.alert('Error', 'Professional ID is missing.');
      return;
    }
  
    try {
      // Assume form.profileImage is already a Base64 string as shown in the working example
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/professionals/update-profile/${professionalId}`,
        form // Sending the form directly as JSON
      );
  
      if (response.status === 200) {
        dispatch(updateUserProfile({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          profileImage: form.profileImage,
        }));
        Alert.alert('Success', 'Profile updated successfully');
        setIsProfileUpdated(true);
        resetForm();
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };
  

  const resetForm = () => {
    setForm({
      firstName: user.professional.firstName,
      lastName: user.professional.lastName,
      email: user.professional.email,
      profession: user.professional.profession,
      certifications: user.professional.certifications,
      emailNotifications: user.professional.emailNotifications,
      pushNotifications: user.professional.pushNotifications,
      clinic: user.professional.clinic,
      attachedToClinic: user.professional.attachedToClinic,
      profileImage: user.professional.profileImage,
      consultationFee: user.professional.consultationFee,
      availability: user.professional.availability || [],
    });
    setIsProfileUpdated(false);
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
                  source={{
                    uri: form.profileImage.uri || form.profileImage || 'https://via.placeholder.com/150',
                  }}
                  style={styles.profileAvatar}
                />
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={pickImage}
                >
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
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Email Notifications</Text>
              <Switch
                onValueChange={(value) => handleProfileChange('emailNotifications', value)}
                value={form.emailNotifications}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Push Notifications</Text>
              <Switch
                onValueChange={(value) => handleProfileChange('pushNotifications', value)}
                value={form.pushNotifications}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Fee</Text>
          <View style={styles.sectionBody}>
            <TextInput
              style={styles.input}
              placeholder="Consultation Fee"
              value={form.consultationFee}
              onChangeText={(text) => handleProfileChange('consultationFee', text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.sectionBody}>
  {(form.availability || []).map((time, index) => (
    <Text key={index}>{time}</Text>
  ))}
  <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
    <Text style={styles.buttonText}>Update Profile</Text>
  </TouchableOpacity>
</View>


        {isProfileUpdated && (
          <Text style={styles.successMessage}>Profile updated successfully!</Text>
        )}
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide">
        <TouchableOpacity onPress={() => setModalVisible(false)}>
          <Text>Close Modal</Text>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionBody: {
    marginTop: 10,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 5,
  },
  profileBody: {
    marginLeft: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHandle: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rowLabel: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default SettingsScreen;
