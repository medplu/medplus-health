// app/client/tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';
import Colors from '../../components/Shared/Colors';
const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          iconName = route.name === 'Home'
            ? (focused ? 'home' : 'home-outline')
            : route.name === 'Profile'
            ? (focused ? 'person' : 'person-outline')
            : route.name === 'Settings'
            ? (focused ? 'settings' : 'settings-outline')
            : undefined;

          return iconName ? <Ionicons name={iconName} size={size} color={color} /> : null;
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
    </Tab.Navigator>
  );
}