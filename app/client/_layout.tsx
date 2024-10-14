// app/client/ClientLayout.tsx
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Header from '../../components/dashboard/Header';
import ClientTabs from './tabs';
import HomeScreen from './HomeScreen';

const Stack = createNativeStackNavigator();

const ClientLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          header: () => <Header />,
        }}
      >
        <Stack.Screen name="tabs" component={ClientTabs} />
        <Stack.Screen name="index" component={HomeScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ClientLayout;