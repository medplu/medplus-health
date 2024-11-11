import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, logout } from '../store/userSlice';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, NavigationProp } from '@react-navigation/native'; 
import { RootStackParamList } from '../navigation/types';

type ProfessionalHeaderNavigationProp = NavigationProp<RootStackParamList, 'ProfessionalHeader'>;

const ProfessionalHeader: React.FC = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigation = useNavigation<ProfessionalHeaderNavigationProp>();

  const handleLogout = () => {
    dispatch(logout());
    navigation.navigate('Login'); 
  };

  return (
    <View style={styles.headerContainer}>
      <Image source={{ uri: user.profileImage }} style={styles.profileImage} /> 
      <Text style={styles.headerTitle}>
        Welcome, {user.professional?.firstName} {user.professional?.lastName}
      </Text>
      <TouchableOpacity onPress={handleLogout}>
        <Icon name="sign-out" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ProfessionalHeader;