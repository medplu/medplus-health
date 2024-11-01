import { View, Image, TouchableOpacity, StyleSheet, SafeAreaView, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';
import { useClerk } from '@clerk/clerk-expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { selectUser, logout } from '../../app/store/userSlice';
import { io } from 'socket.io-client';

export default function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { signOut } = useClerk();

  // Obtain user data from Redux state
  const user = useSelector(selectUser);
  const [newAppointmentCount, setNewAppointmentCount] = useState(0); // State to track new appointments

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(logout()); // Dispatch logout action
      navigation.navigate('login/index');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  // Setting up Socket.IO for real-time updates
  useEffect(() => {
    const socket = io('https://medplus-health.onrender.com');

    socket.on('newAppointment', (appointment) => {
      setNewAppointmentCount((prevCount) => prevCount + 1); // Increment new appointment count
    });

    // Cleanup function to disconnect the socket
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleNotificationPress = () => {
    setNewAppointmentCount(0); // Reset count when notifications are viewed
    navigation.navigate('notifications/index'); // Navigate to the Notifications screen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: 20 }}>
          <Image
            source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <TouchableOpacity 
            style={styles.notificationIcon} 
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={28} color={Colors.PRIMARY} />
            {newAppointmentCount > 0 && ( // Show badge if there are new appointments
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newAppointmentCount > 99 ? '99+' : newAppointmentCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
  notificationIcon: {
    marginRight: 20,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#171717',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    position: 'relative', // Position for badge
  },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutIcon: {
    marginRight: 0,
  },
});
