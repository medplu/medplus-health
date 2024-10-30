import { View, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Shared/Colors';
import { useClerk } from '@clerk/clerk-expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { selectUser, logout } from '../../app/store/userSlice';

export default function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { signOut } = useClerk();
  
  // Obtain user data from Redux state
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await signOut();
      dispatch(logout()); // Dispatch logout action
      navigation.navigate('login/index');
    } catch (error) {
      console.error('Failed to logout', error);
    }
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
          <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={28} color={Colors.PRIMARY} />
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
  },
  logoutIcon: {
    marginRight: 0,
  },
});
