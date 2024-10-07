// app/client/tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import icons
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Define icon based on the route name using ternary operators
          iconName = route.name === 'Home'
            ? (focused ? 'home' : 'home-outline')
            : route.name === 'Profile'
            ? (focused ? 'person' : 'person-outline')
            : route.name === 'Settings'
            ? (focused ? 'settings' : 'settings-outline')
            : undefined;

          // Return the icon component
          return iconName ? <Ionicons name={iconName} size={size} color={color} /> : null;
        },
        tabBarActiveTintColor: 'tomato', // Active icon color
        tabBarInactiveTintColor: 'gray', // Inactive icon color
        tabBarStyle: {
          backgroundColor: 'white', // Background color of the tab bar
          borderTopColor: 'transparent', // Remove the top border
          height: 60, // Height of the tab bar
        },
        headerShown: false, // Remove the header
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}