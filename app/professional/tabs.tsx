// app/professional/tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
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
          let iconName: string = 'help'; 
          
          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline'; 
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline'; 
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline'; 
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline'; 
          }

          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato', 
        tabBarInactiveTintColor: 'gray', 
        tabBarStyle: {
          backgroundColor: 'white', 
          borderTopColor: 'transparent',
          height: 60, 
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Wallet" component={TransactionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}