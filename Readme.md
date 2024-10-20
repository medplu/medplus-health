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
              <TextInput
                style={styles.input}
                placeholder="Consultation Fee"
                value={form.consultationFee}
                onChangeText={(text) => handleProfileChange('consultationFee', text)}
                keyboardType="numeric" // Numeric input for fee
              />
              <TextInput
                style={styles.input}
                placeholder="Availability"
                value={form.availability}
                onChangeText={(text) => handleProfileChange('availability', text)}
              />
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
  consultationFee: string;  // New field for consultation fee
  availability: string;     // New field for availability
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
    consultationFee: '',  // Initialize consultation fee
    availability: '',      // Initialize availability
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
        const storedConsultationFee = await AsyncStorage.getItem('consultationFee');  // Fetching consultation fee
        const storedAvailability = await AsyncStorage.getItem('availability');          // Fetching availability

        setDoctorId(storedDoctorId);

        setForm((prevForm) => ({
          ...prevForm,
          location: storedLocation ? JSON.parse(storedLocation) : prevForm.location,
          email: storedEmail || prevForm.email,
          emailNotifications: storedEmailNotifications ? JSON.parse(storedEmailNotifications) : prevForm.emailNotifications,
          pushNotifications: storedPushNotifications ? JSON.parse(storedPushNotifications) : prevForm.pushNotifications,
          consultationFee: storedConsultationFee || prevForm.consultationFee,  // Set consultation fee
          availability: storedAvailability || prevForm.availability,            // Set availability
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        profileImage: profile.profileImage,
        consultationFee: profile.consultationFee, // Get consultation fee from the profile
        availability: profile.availability,         // Get availability from the profile
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

    if (key === 'emailNotifications' || key === 'pushNotifications' || key === 'email' || key === 'consultationFee' || key === 'availability') {
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

    if (!result.canceled) {
      handleProfileChange('profileImage', result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`https://medplus-app.onrender.com/api/professionals/update-profile/${doctorId}`, {
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

      // Update the form state with the new profile data
      setForm((prevForm) => ({
        ...prevForm,
        firstName: data.professional.firstName,
        lastName: data.professional.lastName,
        email: data.professional.email,
        profileImage: data.professional.profileImage,
        emailNotifications: data.professional.emailNotifications,
        pushNotifications: data.professional.pushNotifications,
        location: data.professional.location,
        consultationFee: data.professional.consultationFee, // Update consultation fee
        availability: data.professional.availability,       // Update availability
      }));

      setModalVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Existing sections remain unchanged */}

        {/* Profile section */}
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
              <TextInput
                style={styles.input}
                placeholder="Consultation Fee"
                value={form.consultationFee}
                onChangeText={(text) => handleProfileChange('consultationFee', text)}
                keyboardType="numeric" // Numeric input for fee
              />
              <TextInput
                style={styles.input}
                placeholder="Availability"
                value={form.availability}
                onChangeText={(text) => handleProfileChange('availability', text)}
              />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionBody: {
    marginTop: 8,
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
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 4,
  },
  profileBody: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHandle: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeText: {
    marginTop: 10,
    color: '#007bff',
  },
});

export default SettingsScreen;
