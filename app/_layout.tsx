// app/_layout.tsx

import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, forwardRef } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import Header from '../components/dashboard/Header';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import UnauthenticatedLayout from './UnauthenticatedLayout';

const ForwardedToast = forwardRef((props, ref) => (
  <Toast {...props} ref={ref} />
));

const Layout = () => {
  const { user, isLoading } = useContext(AuthContext);

  // Ensure to fetch the publishable key from environment variables
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <UnauthenticatedLayout />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          header: () => <Header />,
          headerShown: true,
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            
          }}
        />
        <Stack.Screen
          name="/client/tabs"
          options={{
            title: 'client',
          }}
        />
        <Stack.Screen
          name="clinics/index"
          options={{
            title: 'Clinics',
          }}
        />
        <Stack.Screen
          name="clinics/[name]"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="hospital/book-appointment/[id]"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="hospital/index"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="hospital/[id]"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="student/index"
          options={{
            title: 'student',
          }}
        />
        <Stack.Screen
          name="doctor/index"
          options={{
            title: 'doctor',
          }}
        />
        <Stack.Screen
          name="doctor/[doctorId]"
          options={{
            title: 'Doctor Booking',
          }}
        />
        <Stack.Screen
          name="[missing]"
          options={{
            title: '404',
          }}
        />
      </Stack>
      <ForwardedToast />
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