import { View, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';
import { AntDesign } from '@expo/vector-icons';
import { selectUser, logout, fetchProfileImage } from '../../app/store/userSlice';
import { io } from 'socket.io-client';
import axios from 'axios';

export default function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  
  const user = useSelector(selectUser);
  const userId = useSelector((state) => state.user.userId); 

  const profileImage = useSelector((state) => state.user.profileImage);

  useEffect(() => {
    if (userId) {
      dispatch(fetchProfileImage(userId));
    }
  }, [userId, dispatch]); 

  // Handle logout
  const handleLogout = () => {
    try {
      dispatch(logout()); // Dispatch logout action
      navigation.navigate('login/index'); // Navigate to the login route
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  // Setting up Socket.IO for real-time updates
  useEffect(() => {
    const socket = io('https://medplus-health.onrender.com');
    console.log('Socket connected.');

    // Cleanup function to disconnect the socket
    return () => {
      socket.disconnect();
      console.log('Socket disconnected.');
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={{ marginLeft: 20 }}
        >
          <Image
            source={{
              uri: profileImage || 'https://randomuser.me/api/portraits/women/46.jpg',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
            <AntDesign name="logout" size={28} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: Colors.ligh_gray,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 30,
    backgroundColor: Colors.ligh_gray,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 0,
  },
});
