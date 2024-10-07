// app/professional/tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import icons
import DashboardScreen from './DashboardScreen';
import ScheduleScreen from './ScheduleScreen';
import SettingsScreen from './SettingsScreen';
import TransactionsScreen from './TransactionsScreen';

const Tab = createBottomTabNavigator();

export default function ProfessionalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'help'; // Default icon name

          // Define icon based on the route name
          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline'; // Example icons for Dashboard
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline'; // Example icons for Schedule
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'; // Example icons for Settings
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline'; // Example icons for Wallet
          }

          // Return the icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato', // Active icon color
        tabBarInactiveTintColor: 'gray', // Inactive icon color
        tabBarStyle: {
          backgroundColor: 'white', // Background color of the tab bar
          borderTopColor: 'transparent', // Remove the top border
          height: 60, // Height of the tab bar
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Wallet" component={TransactionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}