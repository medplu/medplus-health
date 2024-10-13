import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';

const { width } = Dimensions.get('window');

export default function Header() {
  const [user, setUser] = useState({ firstName: '', lastName: '', profileImage: '' });
  const navigation = useNavigation();

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
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('user');
      navigation.navigate('login/index');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  return (
    <View style={styles.container}>
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
          <MaterialIcons name="notifications" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <MaterialIcons name="logout" size={28} color="black" />
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
    padding: 10,
    backgroundColor: Colors.ligh_gray,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    marginTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    marginRight: 16,
  },
});