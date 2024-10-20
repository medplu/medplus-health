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
  Platform,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';
import * as Location from 'expo-location';

interface Location {
  latitude: number | null;
  longitude: number | null;
}
interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  location: Location;
  consultationFee: number;
  availability: boolean;
}

const SettingsScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const initialFormState: FormState = {
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    emailNotifications: false,
    pushNotifications: false,
    location: { latitude: null, longitude: null },
    consultationFee: 1000,
    availability: false,
  };
  const [form, setForm] = useState<FormState>(initialFormState);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedDoctorId = await AsyncStorage.getItem('doctorId');
        const storedLocation = await AsyncStorage.getItem('location');
        const storedEmail = await AsyncStorage.getItem('email');
        const storedEmailNotifications = await AsyncStorage.getItem('emailNotifications');
        const storedPushNotifications = await AsyncStorage.getItem('pushNotifications');
        const storedConsultationFee = await AsyncStorage.getItem('consultationFee');
        const storedAvailability = await AsyncStorage.getItem('availability');

        setDoctorId(storedDoctorId);

        setForm((prevForm) => ({
          ...prevForm,
          location: storedLocation ? JSON.parse(storedLocation) : prevForm.location,
          email: storedEmail || prevForm.email,
          emailNotifications: storedEmailNotifications ? JSON.parse(storedEmailNotifications) : prevForm.emailNotifications,
          pushNotifications: storedPushNotifications ? JSON.parse(storedPushNotifications) : prevForm.pushNotifications,
          consultationFee: storedConsultationFee ? JSON.parse(storedConsultationFee) : prevForm.consultationFee,
          availability: storedAvailability ? JSON.parse(storedAvailability) : prevForm.availability,
        }));

        if (storedDoctorId) {
          fetchProfile(storedDoctorId);
        }
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
      }
    };

    fetchUserData();
  }, []);

  const fetchProfile = async (doctorId: string) => {
    console.log(`Fetching profile for doctorId: ${doctorId}`);
    try {
      const response = await axios.get(`https://medplus-app.onrender.com/api/professionals/${doctorId}`);
      const profile = response.data;
      setForm((prevForm) => ({
        ...prevForm,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        profileImage: profile.profileImage || '',
        consultationFee: profile.consultationFee || 1000,
        availability: profile.availability || false,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileChange = async (key: keyof FormState, value: any) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));

    if (key === 'emailNotifications' || key === 'pushNotifications' || key === 'email' || key === 'availability' || key === 'consultationFee') {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (event: any) => {
        if (event.target.files && event.target.files[0]) {
          handleProfileChange('profileImage', event.target.files[0]);
        }
      };
      input.click();
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        handleProfileChange('profileImage', result.assets[0].uri);
      }
    }
  };

  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('emailNotifications', JSON.stringify(form.emailNotifications));
      formData.append('pushNotifications', JSON.stringify(form.pushNotifications));
      formData.append('location', JSON.stringify(form.location));
      formData.append('consultationFee', JSON.stringify(form.consultationFee));
      formData.append('availability', JSON.stringify(form.availability));

      if (form.profileImage) {
        if (typeof form.profileImage === 'string') {
          const uriParts = form.profileImage.split('.');
          const fileType = uriParts[uriParts.length - 1];
          formData.append('profileImage', {
            uri: form.profileImage,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any); // TypeScript workaround for FormData
        } else {
          formData.append('profileImage', form.profileImage);
        }
      }

      const response = await fetch(`https://medplus-app.onrender.com/api/professionals/update-profile/${doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);

      // Update the form state with the new profile data
      setForm((prevForm) => ({
        ...prevForm,
        firstName: data.professional.firstName || '',
        lastName: data.professional.lastName || '',
        email: data.professional.email || '',
        profileImage: data.professional.profileImage || '',
        emailNotifications: data.professional.emailNotifications,
        pushNotifications: data.professional.pushNotifications,
        location: data.professional.location,
        consultationFee: data.professional.consultationFee || 1000,
        availability: data.professional.availability || false,
      }));

      setModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const fetchLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setForm((prevForm) => ({
      ...prevForm,
      location: { latitude, longitude },
    }));
    await AsyncStorage.setItem('location', JSON.stringify({ latitude, longitude }));
  };

  const incrementFee = () => {
    setForm((prevForm) => ({
      ...prevForm,
      consultationFee: prevForm.consultationFee + 100,
    }));
  };

  const decrementFee = () => {
    setForm((prevForm) => ({
      ...prevForm,
      consultationFee: Math.max(prevForm.consultationFee - 100, 1000),
    }));
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
                    uri: typeof form.profileImage === 'string' ? form.profileImage : URL.createObjectURL(form.profileImage),
                  }}
                  style={styles.profileAvatar}
                />
                <TouchableOpacity
                  style={styles.editIconContainer}
                  onPress={() => setModalVisible(true)}
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
            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row} onPress={fetchLocation}>
                <Text style={styles.rowLabel}>Location</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="map-pin" size={19} />
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
          <Text style={styles.sectionTitle}>Availability and Consultation</Text>
          <View style={styles.sectionBody}>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Availability</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={(value) => handleProfileChange('availability', value)}
                  value={form.availability}
                />
              </View>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Consultation Fee</Text>
                <View style={styles.rowSpacer} />
                <TouchableOpacity onPress={decrementFee} style={styles.feeButton}>
                  <FeatherIcon name="minus" size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.feeText}>{form.consultationFee}</Text>
                <TouchableOpacity onPress={incrementFee} style={styles.feeButton}>
                  <FeatherIcon name="plus" size={20} color="#000" />
                </TouchableOpacity>
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

      {/* Modal for updating profile */}
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
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Availability</Text>
              <View style={styles.rowSpacer} />
              <Switch
                onValueChange={(value) => handleProfileChange('availability', value)}
                value={form.availability}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Consultation Fee</Text>
              <View style={styles.rowSpacer} />
              <TouchableOpacity onPress={decrementFee} style={styles.feeButton}>
                <FeatherIcon name="minus" size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.feeText}>{form.consultationFee}</Text>
              <TouchableOpacity onPress={incrementFee} style={styles.feeButton}>
                <FeatherIcon name="plus" size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick Profile Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={updateProfile}>
              <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
  sectionBody: {
    padding: 16,
  },
  rowWrapper: {
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
  },
  rowSpacer: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
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
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 4,
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileHandle: {
    fontSize: 14,
    color: '#777',
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  feeButton: {
    padding: 10,
  },
  feeText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
});

export default SettingsScreen;