import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../store/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native'; 
import { AntDesign } from '@expo/vector-icons';

const ProfessionalHeader: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigation.navigate('login/index'); // Ensure this matches your login route
  }, [dispatch, navigation]);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ marginLeft: 20 }}>
        <Image
          source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Welcome </Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
          <AntDesign name="logout" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4CAF50',
  },
  headerContainer: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80, 
   
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 20,
  },
});

export default ProfessionalHeader;