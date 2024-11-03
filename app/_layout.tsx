// src/app/_layout.tsx
import { StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore'; // Adjust the path based on your project structure
import { ScheduleProvider } from './context/ScheduleContext'; // Adjust the path based on your project structure
import UnauthenticatedLayout from './UnauthenticatedLayout';
import * as NavigationBar from 'expo-navigation-bar';

const Layout = ({ user, isLoading }) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  useEffect(() => {
    // Set the bottom navigation bar color to match the screen background
    const backgroundColor = '#FFFFFF'; // Set this to your desired background color
    NavigationBar.setBackgroundColorAsync(backgroundColor);
    NavigationBar.setVisibilityAsync('visible'); // Make sure it's visible

    // Clean up function to reset navigation bar color on unmount
    return () => {
      NavigationBar.setBackgroundColorAsync('#FFFFFF'); // Reset to default or any other color
    };
  }, []);

  // Show loading state if the user data is being fetched
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Show UnauthenticatedLayout if the user is not logged in
  if (!user) {
    return <UnauthenticatedLayout />;
  }

  // If user is authenticated, render the authenticated layout with different screens
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="client/tabs" options={{ headerShown: false }} />
        <Stack.Screen name="clinics/index" options={{ title: 'Clinics', headerShown: true }} />
        <Stack.Screen name="clinics/[name]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/index" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/[id]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="student/index" options={{ title: 'Student', headerShown: true }} />
        <Stack.Screen name="doctor/index" options={{ title: 'Doctor', headerShown: true }} />
        <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking', headerShown: true }} />
        <Stack.Screen name="alldoctors/index" options={{ title: 'All Doctors', headerShown: true }} />
        <Stack.Screen name="[missing]" options={{ title: '404', headerShown: true }} />
      </Stack>
    </SafeAreaView>
  );
};

const LayoutWithProviders = ({ user, isLoading }) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ScheduleProvider>
              <Layout user={user} isLoading={isLoading} />
            </ScheduleProvider>
          </PersistGate>
        </Provider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default LayoutWithProviders;

const styles = StyleSheet.create({});
