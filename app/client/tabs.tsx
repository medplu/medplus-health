// app/client/tabs.tsx
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import { View, Text } from 'react-native';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import NotificationsScreen from './NotificationsScreen';
import Colors from '../../components/Shared/Colors';
import useAppointments from '../../hooks/useAppointments';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/userSlice'; // Assuming you have a userSlice

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  const { appointments } = useAppointments();
  const user = useSelector(selectUser); // Obtain user from Redux
  const [newAppointmentsCount, setNewAppointmentsCount] = useState(0);

  useEffect(() => {
    const newAppointments = appointments.filter(appointment => appointment.status === 'new');
    setNewAppointmentsCount(newAppointments.length);
  }, [appointments]);

  useEffect(() => {
    const socket = io('https://medplus-health.onrender.com'); // Replace with your backend URL

    if (user) {
      socket.emit('join', user.userId); // Join the socket room for the specific user

      socket.on('newAppointment', (data) => {
        setNewAppointmentsCount(prevCount => prevCount + 1);
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let badgeCount = 0;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            badgeCount = newAppointmentsCount;
          }

          return (
            <View>
              <Ionicons name={iconName as any} size={size} color={color} />
              {badgeCount > 0 && (
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -3,
                  backgroundColor: 'red',
                  borderRadius: 6,
                  width: 12,
                  height: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: 'tomato', 
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: Colors.ligh_gray,
          borderTopColor: 'transparent',
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Appointments" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}