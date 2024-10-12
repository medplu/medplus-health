import { View, Text, TouchableOpacity, StyleSheet  } from 'react-native';
import React, { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
export default function SharedHeader({ title }) {
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
        <Image source={{ uri: user.profileImage || 'https://randomuser.me/api/portraits/women/46.jpg' }} style={styles.profileImage} />
        <View>
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
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  greetingText: {
    fontFamily: 'Inter-Black',
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Black-Bold',
  },
});