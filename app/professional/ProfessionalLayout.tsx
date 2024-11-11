// app/professional/ProfessionalLayout.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessionalHeader from './ProfessionalHeader'; // Import the custom header component
import ProfessionalTabs from './tabs';
import DashboardScreen from './DashboardScreen';
import ScheduleScreen from './ScheduleScreen';
import SettingsScreen from './SettingsScreen';
import TransactionsScreen from './TransactionsScreen';

const Stack = createNativeStackNavigator();

const ProfessionalLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ProfessionalHeader /> {/* Use the customized header */}
      <ProfessionalTabs /> {/* Directly use ProfessionalTabs without another Stack.Navigator */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfessionalLayout;