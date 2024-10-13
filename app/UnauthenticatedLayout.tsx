// app/UnauthenticatedLayout.tsx

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

const UnauthenticatedLayout = () => {
  return (
    <>
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
      </Stack>
      <Toast />
    </>
  );
};

export default UnauthenticatedLayout;

const styles = StyleSheet.create({});