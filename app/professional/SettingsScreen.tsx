import React, { useState, useEffect } from 'react';
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
  Button,
  Platform,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [form, setForm] = useState({
    emailNotifications: true,
    pushNotifications: false,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    profileImage: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          console.error('User ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching user ID from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleProfileChange = (key: keyof typeof form, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  };

  const pickImage = async () => {
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

    if (!result.canceled && 'uri' in result) {
      if (!result.canceled) {
        const successResult = result as ImagePicker.ImagePickerSuccessResult;
        handleProfileChange('profileImage', successResult.uri);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleProfileChange('profileImage', URL.createObjectURL(event.target.files[0]));
    }
  };

  const updateProfile = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is required to update profile');
      }

      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('emailNotifications', String(form.emailNotifications));
      formData.append('pushNotifications', String(form.pushNotifications));
      if (form.profileImage) {
        const uriParts = form.profileImage.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('profileImage', {
          uri: form.profileImage,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any); // TypeScript workaround for FormData
      }

      const response = await axios.put(`https://medplus-app.onrender.com/api/professionals/update-profile/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalVisible(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <View style={styles.header}>
        <View style={styles.headerAction}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <FeatherIcon
              color="#000"
              name="arrow-left"
              size={24} />
          </TouchableOpacity>
        </View>

        <Text numberOfLines={1} style={styles.headerTitle}>
          Settings
        </Text>

        <View style={[styles.headerAction, { alignItems: 'flex-end' }]}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <FeatherIcon
              color="#000"
              name="more-vertical"
              size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { paddingTop: 4 }]}>
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
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Language</Text>

                <View style={styles.rowSpacer} />

                <Text style={styles.rowValue}>English</Text>

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Location</Text>

                <View style={styles.rowSpacer} />

                <Text style={styles.rowValue}>Los Angeles, CA</Text>

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Email Notifications</Text>

                <View style={styles.rowSpacer} />

                <Switch
                  onValueChange={emailNotifications =>
                    setForm({ ...form, emailNotifications })
                  }
                  style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
                  value={form.emailNotifications} />
              </View>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Push Notifications</Text>

                <View style={styles.rowSpacer} />

                <Switch
                  onValueChange={pushNotifications =>
                    setForm({ ...form, pushNotifications })
                  }
                  style={{ transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }] }}
                  value={form.pushNotifications} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <View style={styles.sectionBody}>
            <View style={[styles.rowWrapper, styles.rowFirst]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Contact Us</Text>

                <View style={styles.rowSpacer} />

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Report Bug</Text>

                <View style={styles.rowSpacer} />

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowWrapper}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Rate in App Store</Text>

                <View style={styles.rowSpacer} />

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowWrapper, styles.rowLast]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={styles.rowLabel}>Terms and Privacy</Text>

                <View style={styles.rowSpacer} />

                <FeatherIcon
                  color="#bcbcbc"
                  name="chevron-right"
                  size={19} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionBody}>
            <View
              style={[
                styles.rowWrapper,
                styles.rowFirst,
                styles.rowLast,
                { alignItems: 'center' },
              ]}>
              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}
                style={styles.row}>
                <Text style={[styles.rowLabel, styles.rowLabelLogout]}>
                  Log Out
                </Text>
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
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile Image</Text>

            {Platform.OS === 'web' ? (
              <input type="file" accept="image/*" onChange={handleImageChange} />
            ) : (
              <Button title="Pick an image from camera roll" onPress={pickImage} />
            )}

            {form.profileImage && (
              <Image
                source={{ uri: form.profileImage }}
                style={styles.profileAvatar}
              />
            )}

            <Button title="Save" onPress={updateProfile} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  profile: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 9999,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 9999,
    padding: 4,
  },
  profileBody: {
    marginLeft: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SettingsScreen;