import * as SecureStore from 'expo-secure-store';
import { StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore';
import { ScheduleProvider } from './context/ScheduleContext';
import UnauthenticatedLayout from './UnauthenticatedLayout';
import * as NavigationBar from 'expo-navigation-bar';
import { selectUser } from './store/userSlice';

const tokenCache = {
  async getToken(key: string): Promise<string | null> {
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
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save token error:', err);
    }
  },
};

const Layout: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('rgba(0, 0, 0, 0)');
    NavigationBar.setVisibilityAsync('visible');

    return () => {
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
    };
  }, []);

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
      <Stack.Navigator>
        <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
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
        <Stack.Screen name="AddClinic" options={{ title: 'AddClinic' }} />
        <Stack.Screen name="tasks" options={{ title: 'Tasks', headerShown: true }} />
        <Stack.Screen name="consultations/index" options={{ title: 'Patients', headerShown: true }} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const MainLayout: React.FC = () => {
  const user = useSelector(selectUser);

  return <Layout />;
};

const LayoutWithProviders: React.FC = () => (
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