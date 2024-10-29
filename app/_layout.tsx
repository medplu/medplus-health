// src/app/_layout.tsx
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore'; // Adjust the path based on your project structure
import { ScheduleProvider } from './context/ScheduleContext'; // Adjust the path based on your project structure

const Layout = () => {
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
              <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="client/tabs" options={{ headerShown: false }} />
                  <Stack.Screen name="clinics/index" options={{ title: 'Clinics' }} />
                  <Stack.Screen name="search/index" options={{ title: 'Search' }} />
                  <Stack.Screen name="clinics/[name]" options={{ title: '' }} />
                  <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '' }} />
                  <Stack.Screen name="hospital/index" options={{ title: '' }} />
                  <Stack.Screen name="hospital/[id]" options={{ title: '' }} />
                  <Stack.Screen name="student/index" options={{ title: 'Student' }} />
                  <Stack.Screen name="doctor/index" options={{ title: 'Doctor' }} />
                  <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking' }} />
                  <Stack.Screen name="alldoctors/index" options={{ title: 'All Doctors' }} />
                  <Stack.Screen name="ClinicDoctorsList" options={{ title: 'Clinic Doctors List' }} />
                  <Stack.Screen name="patient/[patientId]" options={{ title: 'Patient Profile' }} />
                  <Stack.Screen name="[missing]" options={{ title: '404' }} />
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