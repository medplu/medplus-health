// app/student/tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Import icons
import CoursesScreen from './HomeScreen';
import AssignmentsScreen from './AssignmentsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Define icon based on the route name
          if (route.name === 'Courses') {
            iconName = focused ? 'book' : 'book-outline'; // Example icons for Courses
          } else if (route.name === 'Assignments') {
            iconName = focused ? 'document' : 'document-outline'; // Example icons for Assignments
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline'; // Example icons for Profile
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
      <Tab.Screen name="Courses" component={CoursesScreen} />
      <Tab.Screen name="Assignments" component={AssignmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
