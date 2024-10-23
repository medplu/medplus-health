// app/professional/ProfessionalLayout.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header'; // Assuming you have a Header component
import ProfessionalTabs from './tabs';
import DashboardScreen from './DashboardScreen';
import ScheduleScreen from './ScheduleScreen';
import SettingsScreen from './SettingsScreen';
import TransactionsScreen from './TransactionsScreen';

const Stack = createNativeStackNavigator();

const ProfessionalLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          header: () => <Header />, // Custom header component
        }}
      >
        <Stack.Screen name="tabs" component={ProfessionalTabs} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Wallet" component={TransactionsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfessionalLayout;