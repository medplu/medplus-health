// app/_layout.tsx

import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, forwardRef } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import Header from '../components/dashboard/Header';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";

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

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <>
          <Header />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: '',
              }}
            />
            <Stack.Screen
              name="register/index"
              options={{
                title: 'Register',
              }}
            />
            <Stack.Screen
              name="login/index"
              options={{
                title: 'Login Modal',
                presentation: 'modal',
              }}
            />
            {user && (
              <>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="client/index"
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
              </>
            )}
          </Stack>
          <ForwardedToast />
        </>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

const LayoutWithAuthProvider = () => (
  <AuthProvider>
    <Layout />
  </AuthProvider>
);

export default LayoutWithAuthProvider;

const styles = StyleSheet.create({});