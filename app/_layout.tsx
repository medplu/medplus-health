import * as SecureStore from 'expo-secure-store';
import { StyleSheet, SafeAreaView, StatusBar, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/configureStore'; // Adjust path as needed
import { ScheduleProvider } from './context/ScheduleContext'; // Adjust path as needed
import UnauthenticatedLayout from './UnauthenticatedLayout';
import * as NavigationBar from 'expo-navigation-bar';
import { SplashScreen } from 'expo-router';

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
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '399287117531-tmvmbo06a5l8svihhb7c7smqt7iobbs0.apps.googleusercontent.com', // Replace with your web client ID
    });

    // Set up navigation bar
    NavigationBar.setBackgroundColorAsync('rgba(0, 0, 0, 0)');
    NavigationBar.setVisibilityAsync('visible');

    // Clean up navigation bar on unmount
    return () => {
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
    };
  }, []);

  // Function to handle Google Sign-In
  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUser(userInfo);
      setIsLoaded(true);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login process');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services is not available');
      } else {
        console.error(error);
      }
      setIsLoaded(true); // Even if sign-in fails, stop loading
    }
  };

  // Auto-login or check if user is already signed in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          const userInfo = await GoogleSignin.getCurrentUser();
          setUser(userInfo);
        }
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
    return <UnauthenticatedLayout signInWithGoogle={signInWithGoogle} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="oauth/callback" options={{ headerShown: false }} />
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

const LayoutWithProviders = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ScheduleProvider>
        <Layout />
      </ScheduleProvider>
    </PersistGate>
  </Provider>
);

export default LayoutWithProviders;

const styles = StyleSheet.create({});
