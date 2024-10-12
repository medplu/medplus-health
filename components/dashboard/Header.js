import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.greetingText}>Hello, 👋</Text>
          <Text style={styles.userName}>{`${user.firstName} ${user.lastName}`}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
        <MaterialIcons name="notifications" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.ligh_gray,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: width,
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
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Inter-Bold',
  },
});