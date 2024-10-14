import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors'; // Import the Colors object
import { useClerk } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={[Colors.ligh_gray, Colors.SECONDARY]} // Changed from transparent to lightGray
        style={styles.container}
      >
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => {}} style={{ marginLeft: 20 }}>
            <Image
              source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.userName}>Welcome, {user.firstName}</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color={Colors.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
            <AntDesign name="logout" size={28} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightGray, // Ensure this matches your overall background color
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    width: '100%', // Ensure it takes the full width
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginTop: StatusBar.currentHeight || 0, // Add margin to avoid overlapping with the status bar
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50, // Increased size for better visibility
    height: 50, // Increased size for better visibility
    borderRadius: 25, // Adjusted for new size
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontFamily: 'Inter-Bold',
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
