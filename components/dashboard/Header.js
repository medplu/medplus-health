import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors'; // Import the Colors object
import { useClerk } from '@clerk/clerk-expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function Header() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState({ firstName: '', lastName: '', profileImage: '' });
  const navigation = useNavigation();
  const { signOut } = useClerk();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const response = await axios.get(`https://medplus-app.onrender.com/api/users/${userId}`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');
      await signOut();
      setSuccessMessage('Successfully logged out');
      navigation.navigate('login/index');
    } catch (error) {
      console.error('Failed to logout', error);
      setErrorMessage('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {}} style={{ marginLeft: 20 }}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <AntDesign name="logout" size={28} color={Colors.PRIMARY} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: Colors.lightGray,
  },
  profileImage: {
    width: 50, // Increased size for better visibility
    height: 50, // Increased size for better visibility
    borderRadius: 25, // Adjusted for new size
    marginRight: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 20,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#171717',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutIcon: {
    marginRight: 0,
  },
});