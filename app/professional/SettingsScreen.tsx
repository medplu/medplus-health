import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Button,
  Switch,
  ActivityIndicator,
  Modal,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import Colors from '@/components/Shared/Colors';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useSelector(selectUser);
  const userId = user.userId;

  const [name, setName] = useState<string>(user.name || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [contactInfo, setContactInfo] = useState<string>(user.contactInfo || '');
  const [image, setImage] = useState<string | null>(user.profileImage || null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [consultationFee, setConsultationFee] = useState<string>(user.consultationFee || '');
  const [permissions, setPermissions] = useState<string>(user.permissions || '');
  const [wallet, setWallet] = useState<string>(user.wallet || '');
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('English');
  const [location, setLocation] = useState<string>('Los Angeles, CA');
  const [pushNotifications, setPushNotifications] = useState<boolean>(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');
        const storedLocation = await AsyncStorage.getItem('location');
        const storedPushNotifications = await AsyncStorage.getItem('pushNotifications');

        if (storedLanguage) setLanguage(storedLanguage);
        if (storedLocation) setLocation(storedLocation);
        if (storedPushNotifications) setPushNotifications(JSON.parse(storedPushNotifications));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const savePreference = async (key: string, value: string | boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
    }
  };

  const handleLanguageChange = async () => {
    const newLanguage = language === 'English' ? 'Spanish' : 'English';
    setLanguage(newLanguage);
    await savePreference('language', newLanguage);
  };

  const handleLocationAccess = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const newLocation = `${location.coords.latitude}, ${location.coords.longitude}`;
    setLocation(newLocation);
    await savePreference('location', newLocation);
  };

  const handlePushNotificationsChange = (newPushNotifications: boolean) => {
    setPushNotifications(newPushNotifications);
    savePreference('pushNotifications', newPushNotifications);
  };

  const resizeImage = async (uri: string) => {
    const result = await ImageManipulator.manipulateAsync(uri, [
      { resize: { width: 800 } },
    ]);
    return result.uri;
  };

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const resizedUri = await resizeImage(result.assets[0].uri);
      setImage(resizedUri);
    }
  }, []);

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    const data = new FormData();
    const response = await fetch(imageUri);
    const blob = await response.blob();

    data.append('file', blob);
    data.append('upload_preset', 'medplus');
    data.append('quality', 'auto');
    data.append('fetch_format', 'auto');

    try {
      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dws2bgxg4/image/upload', {
        method: 'POST',
        body: data,
      });
      const result = await uploadResponse.json();
      return result.secure_url;
    } catch (uploadError) {
      console.error('Error uploading image to Cloudinary:', uploadError);
      throw uploadError;
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let imageUrl = image;
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
      }

      const profileData = {
        name,
        email,
        contactInfo,
        profileImage: imageUrl,
        consultationFee,
        permissions,
        wallet,
      };

      const response = await axios.put(
        `https://medplus-app.onrender.com/api/users/update-profile/${userId}`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Profile updated:', response.data);
      setName('');
      setEmail('');
      setContactInfo('');
      setImage(null);
      setModalVisible(false);
    } catch (updateError) {
      console.error('Error updating profile:', updateError);
      setError('Failed to update profile');
    } finally {
      setUploading(false);
    }
  }, [userId, name, email, contactInfo, image, consultationFee, permissions, wallet]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.ligh_gray }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FeatherIcon color="#000" name="arrow-left" size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          Settings
        </Text>

        <View style={[styles.headerAction, { alignItems: 'flex-end' }]}>
          <TouchableOpacity onPress={() => { /* handle onPress */ }}>
            <FeatherIcon color="#000" name="more-vertical" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('EditProfile')}>
              <Image
                alt=""
                source={{ uri: image || 'default-avatar-uri' }}
                style={styles.profileAvatar}
              />
              <View style={styles.profileBody}>
                <Text style={styles.profileName}>{name || 'Full Name'}</Text>
                <Text style={styles.profileHandle}>{email || 'email@example.com'}</Text>
              </View>
              <FeatherIcon color="#bcbcbc" name="chevron-right" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row} onPress={handleLanguageChange}>
                <Text style={styles.rowLabel}>Language</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>{language}</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row} onPress={handleLocationAccess}>
                <Text style={styles.rowLabel}>Location</Text>
                <View style={styles.rowSpacer} />
                <Text style={styles.rowValue}>{location}</Text>
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <View style={styles.rowSpacer} />
                <Switch
                  onValueChange={handlePushNotificationsChange}
                  style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
                  value={pushNotifications}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { paddingTop: 4 }]}>
          <Text style={styles.sectionTitle}>Clinic & Account</Text>

          <View style={styles.sectionBody}>
            <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('AccountSettings')}>
              
              <FeatherIcon color="#bcbcbc" name="chevron-right" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Contact')}>
                <Text style={styles.rowLabel}>Contact</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Policy')}>
                <Text style={styles.rowLabel}>Policy</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Updates')}>
                <Text style={styles.rowLabel}>Updates</Text>
                <View style={styles.rowSpacer} />
                <FeatherIcon color="#bcbcbc" name="chevron-right" size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst, styles.rowLast, { alignItems: 'center' }]}>
              <TouchableOpacity onPress={() => { /* handle onPress */ }} style={styles.row}>
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.contentFooter}>App Version 2.24 #50491</Text>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Information</Text>
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
          <TextInput
            style={styles.input}
            placeholder="Consultation Fee"
            value={consultationFee}
            onChangeText={setConsultationFee}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Pick an image from camera roll</Text>
          </TouchableOpacity>
          <Button title={uploading ? "Updating..." : "Update Profile"} onPress={handleSubmit} disabled={uploading} />
          {uploading && <ActivityIndicator size="large" color="#0000ff" />}
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /** Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#000',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    textAlign: 'center',
  },
  /** Content */
  content: {
    paddingHorizontal: 16,
  },
  contentFooter: {
    marginTop: 24,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    color: '#a69f9f',
  },
  /** Section */
  section: {
    paddingVertical: 12,
  },
  sectionTitle: {
    margin: 8,
    marginLeft: 12,
    fontSize: 13,
    letterSpacing: 0.33,
    fontWeight: '500',
    color: '#a69f9f',
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  /** Profile */
  profile: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    marginRight: 12,
  },
  profileBody: {
    marginRight: 'auto',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
  },
  profileHandle: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '400',
    color: '#858585',
  },
  /** Row */
  row: {
    height: 44,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingRight: 12,
  },
  rowWrapper: {
    paddingLeft: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
  },
  rowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rowLabel: {
    fontSize: 16,
    letterSpacing: 0.24,
    color: '#000',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ababab',
    marginRight: 4,
  },
  rowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  rowLabelLogout: {
    width: '100%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#dc2626',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  uploadButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SettingsScreen;
