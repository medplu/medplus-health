import * as SecureStore from 'expo-secure-store';
import { StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore'; // Adjust path as needed
import { ScheduleProvider } from './context/ScheduleContext'; // Adjust path as needed
import UnauthenticatedLayout from './UnauthenticatedLayout';
import * as NavigationBar from 'expo-navigation-bar';
import ProfessionalLayout from './professional/ProfessionalLayout';
import { selectUser } from './store/userSlice';

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log('No values stored under key: ' + key);
      }
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save token error:', err);
    }
  },
};

const Layout = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set up navigation bar
    NavigationBar.setBackgroundColorAsync('rgba(0, 0, 0, 0)');
    NavigationBar.setVisibilityAsync('visible');

    // Clean up navigation bar on unmount
    return () => {
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
    };
  }, []);

  // Auto-login or check if user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Example: const userInfo = await SecureStore.getItemAsync('user');
        // setUser(userInfo);
      } catch (error) {
        console.error('Error checking user sign-in:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    checkUser();
  }, []);

 

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="dark-content" />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <UnauthenticatedLayout />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator initialRouteName={user.userType === 'professional' ? 'professional/dashboard' : 'client/tabs'}>
        <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
        {/* Remove the 'professional/layout' screen */}
        {/* <Stack.Screen
          name="professional/layout"
          component={ProfessionalLayout}
          options={{ headerShown: false }}
        /> */}
        {/* Remove or comment out the 'tabs' screen to avoid conflicts */}
        {/* <Stack.Screen name="tabs" options={{ headerShown: false }} /> */}
        <Stack.Screen name="clinics/index" options={{ title: 'Clinics', headerShown: true }} />
        <Stack.Screen name="clinics/[name]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/index" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="hospital/[id]" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="student/index" options={{ title: 'Student', headerShown: true }} />
        <Stack.Screen name="doctor/index" options={{ title: 'Doctor', headerShown: false }} />
        <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Booking', headerShown: true }} />
        <Stack.Screen name="alldoctors/index" options={{ title: 'All Doctors', headerShown: true }} />
        <Stack.Screen name="[missing]" options={{ title: '404', headerShown: true }} />
        <Stack.Screen name="pharmacist/dashboard" options={{ title: 'Pharmacist Dashboard' }} />
        <Stack.Screen name="pharmacist/tabs" options={{ headerShown: false }} />
        <Stack.Screen name="appointment/[appointmentId]" options={{ title: 'Appointment Details' }} />
        <Stack.Screen name="PrescriptionScreen" options={{ title: 'Prescription' }} />
        <Stack.Screen name="AddClinicForm" options={{ title: 'AddClinic' }} />
        <Stack.Screen name="tasks" options={{ title: 'Tasks', headerShown: true }} />
        <Stack.Screen name="consultations/index" options={{ title: 'Patients', headerShown: true }} />

        {user.userType === 'professional' && (
          <>
            <Stack.Screen name="professional/dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            {/* ...other professional screens... */}
          </>
        )}

        {user.userType === 'client' && (
          <>
            <Stack.Screen name="client/tabs" component={ClientTabs} options={{ headerShown: false }} />
            {/* ...other client screens... */}
          </>
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
};

// Modify MainLayout to remove conditional rendering of ProfessionalLayout
const MainLayout = () => {
  const user = useSelector(selectUser);

  // No longer conditionally render ProfessionalLayout here
  return <Layout />;
};

const LayoutWithProviders = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ScheduleProvider>
        <MainLayout />
      </ScheduleProvider>
    </PersistGate>
  </Provider>
);

export default LayoutWithProviders;

const styles = StyleSheet.create({});