import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, forwardRef } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';

import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import UnauthenticatedLayout from './UnauthenticatedLayout';


const Layout = () => {
  const { user, isLoading } = useContext(AuthContext);

  // Ensure to fetch the publishable key from environment variables
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  // Show loading state if the user data is being fetched
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Show UnauthenticatedLayout if the user is not logged in
  if (!user) {
    return <UnauthenticatedLayout />;
  }

  // If user is authenticated, render the authenticated layout with different screens
  return (
    <>
     <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="client/tabs" options={{ headerShown: false }} />
  <Stack.Screen name="clinics/index" options={{ title: 'Clinics' }} />
  <Stack.Screen name="clinics/[name]" options={{ title: '' }} />
  <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '' }} />
  <Stack.Screen name="hospital/index" options={{ title: '' }} />
  <Stack.Screen name="hospital/[id]" options={{ title: '' }} />
  <Stack.Screen name="student/index" options={{ title: 'Student' }} />
  <Stack.Screen name="doctor/index" options={{ title: 'Doctor' }} />
  <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking' }} />
  <Stack.Screen name="[missing]" options={{ title: '404' }} />
</Stack>

 
    </>
  );
};

const LayoutWithProviders = () => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default LayoutWithProviders;

const styles = StyleSheet.create({});
