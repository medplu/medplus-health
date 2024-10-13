import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';
import { useClerk } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';

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
      // Optional: Show a loading indicator
      setLoading(true);
  
      // Clear AsyncStorage
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken'); // Clear the auth token if you're storing it
  
      // Sign out from Clerk
      await signOut();
  
      // Optional: Show a success message
      setSuccessMessage('Successfully logged out');
  
      // Navigate to login screen
      navigation.navigate('login/index');
    } catch (error) {
      console.error('Failed to logout', error);
      // Optional: Show an error message to the user
      setErrorMessage('Logout failed. Please try again.');
    } finally {
      // Optional: Hide the loading indicator
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f95959', '#f77b7b']} // Two colors for the gradient
      style={styles.container}
    >
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>Hello, 👋</Text>
          <Text style={styles.userName}>{user.firstName}</Text>
        </View>
      </View>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <MaterialIcons name="logout" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    width: width,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 16,
  },
  logoutIcon: {
    marginRight: 0,
  },
});