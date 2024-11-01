// src/app/_layout.tsx
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore'; // Adjust the path based on your project structure
import { ScheduleProvider } from './context/ScheduleContext'; // Adjust the path based on your project structure
import * as NavigationBar from 'expo-navigation-bar';

const Layout = () => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  useEffect(() => {
    // Hide the Android navigation bar
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ScheduleProvider>
              <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: '#ffffff' }}>
                <StatusBar backgroundColor="#feffdf" barStyle="dark-content" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="client/tabs" options={{ headerShown: false }} />
                  <Stack.Screen name="clinics/index" options={{ title: 'Clinics', headerShown: true }} />
                  <Stack.Screen name="notifications/index" options={{ title: 'Notifications', headerShown: true }} />
                  <Stack.Screen name="search/index" options={{ title: 'Search', headerShown: true }} />
                  <Stack.Screen name="clinics/[name]" options={{ title: '', headerShown: false }} />
                  <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '', headerShown: false }} />
                  <Stack.Screen name="hospital/index" options={{ title: '', headerShown: false }} />
                  <Stack.Screen name="hospital/[id]" options={{ title: '', headerShown: false }} />
                  <Stack.Screen name="student/index" options={{ title: 'Student', headerShown: true }} />
                  <Stack.Screen name="doctor/index" options={{ title: 'Doctor', headerShown: true }} />
                  <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking', headerShown: true }} />
                  <Stack.Screen name="alldoctors/index" options={{ title: 'All Doctors', headerShown: true }} />
                  <Stack.Screen name="ClinicDoctorsList" options={{ title: 'Clinic Doctors List', headerShown: true }} />
                  <Stack.Screen name="patient/[patientId]" options={{ title: 'Patient Profile', headerShown: true }} />
                  <Stack.Screen name="[missing]" options={{ title: '404', headerShown: true }} />
                </Stack>
              </SafeAreaView>
            </ScheduleProvider>
          </PersistGate>
        </Provider>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default Layout;

const styles = StyleSheet.create({});