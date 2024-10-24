import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import React, { useContext } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import UnauthenticatedLayout from './UnauthenticatedLayout';
import { ScheduleProvider } from '../context/ScheduleContext';

const Layout = () => {
  const { user, isLoading } = useContext(AuthContext);

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
        <Stack.Screen name="clinics/index" options={{ title: 'Clinics' }} />
        <Stack.Screen name="clinics/[name]" options={{ title: '' }} />
        <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '' }} />
        <Stack.Screen name="hospital/index" options={{ title: '' }} />
        <Stack.Screen name="hospital/[id]" options={{ title: '' }} />
        <Stack.Screen name="student/index" options={{ title: 'Student' }} />
        <Stack.Screen name="doctor/index" options={{ title: 'Doctor' }} />
        <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking' }} />
        <Stack.Screen name="alldoctors/index" options={{ title: 'All Doctors' }} />
        <Stack.Screen name="ClinicDoctorsList" options={{ title: 'Clinic Doctors List' }} /> {/* Add the ClinicDoctorsList screen */}
        <Stack.Screen name="[missing]" options={{ title: '404' }} />
      </Stack>
    </SafeAreaView>
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
          <ScheduleProvider>
            <Layout />
          </ScheduleProvider>
        </AuthProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default LayoutWithProviders;

const styles = StyleSheet.create({});