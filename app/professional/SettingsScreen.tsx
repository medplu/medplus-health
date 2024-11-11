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
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile, selectUser } from '../store/userSlice';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dws2bgxg4/image/medplus';
const CLOUDINARY_UPLOAD_PRESET = 'medplus';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  certifications: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  clinic: string;
  attachedToClinic: boolean;
  profileImage: string;
  consultationFee: string;
  availability: string[];
}

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const professionalId = user?.professional?._id;

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [form, setForm] = useState<FormState>({
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
    availability: [],
  });

  const [isProfileUpdated, setIsProfileUpdated] = useState<boolean>(false);

  useEffect(() => {
    if (user?.professional) {
      if (user.professional) {
        setForm((prevForm) => ({
          ...prevForm,
          firstName: user.professional.firstName || '',
          lastName: user.professional.lastName || '',
          email: user.professional.email || '',
          profession: user.professional.profession || '',
          certifications: user.professional.certifications || [],
          emailNotifications: user.professional.emailNotifications || false,
          pushNotifications: user.professional.pushNotifications || false,
          clinic: user.professional.clinic || '',
          attachedToClinic: user.professional.attachedToClinic || false,
          profileImage: user.professional.profileImage || '',
          consultationFee: user.professional.consultationFee || '',
          availability: user.professional.availability || [],
        }));
      }
    }
  }, [user]);

  const handleProfileChange = (key: keyof FormState, value: any) => {
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

    if (!result.canceled && result.assets) {
      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('file', { uri: localUri, name: filename, type });
      formData.append('upload_preset', 'medplus');

      try {
        const response = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          handleProfileChange('profileImage', data.secure_url);
        } else {
          Alert.alert('Error', 'Failed to upload image to Cloudinary.');
        }
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      }
    }
  };

  const updateProfile = async () => {
    if (!professionalId) {
      Alert.alert('Error', 'Professional ID is missing.');
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (key === 'profileImage') {
          formData.append(key, form[key]);
        } else if (Array.isArray(form[key])) {
          form[key].forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, form[key]);
        }
      });

      const response = await fetch(
        `https://medplus-health.onrender.com/api/professionals/update-profile/${professionalId}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      dispatch(updateUserProfile(updatedProfile.professional));
      console.log('Profile updated successfully:', updatedProfile);

      setIsProfileUpdated(true);
      resetForm();
      setModalVisible(false);
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
                    uri: form.profileImage || 'https://via.placeholder.com/150',
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.sectionBody}>
            {form.availability.map((time, index) => (
              <Text key={index}>{time}</Text>
            ))}
            <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
              <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
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
