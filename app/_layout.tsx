import { StyleSheet, Text, View } from 'react-native';
import React, { useContext } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';

const _layout = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: AuthContext is not provided</Text>
      </View>
    );
  }

  const { token, isLoading } = authContext;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
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
          title: 'Clinic Details',
        }}
      />
        <Stack.Screen
        name="hospital/book-appointment/[id]"
        options={{
          title: 'Book Appointment',
        }}
      />
      <Stack.Screen
        name="hospital/index"
        options={{
          title: 'hospital-details',
        }}
      />
        <Stack.Screen
        name="hospital/[id]"
        options={{
          title: 'Hospital Details',
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
        name="[missing]"
        options={{
          title: '404',
        }}
      />
    </Stack>
  );
};

const LayoutWithAuthProvider = () => (
  <AuthProvider>
    <_layout />
  </AuthProvider>
);

export default LayoutWithAuthProvider;

const styles = StyleSheet.create({});