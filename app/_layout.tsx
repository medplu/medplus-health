import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, forwardRef } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import Header from '../components/dashboard/Header';



const ForwardedToast = forwardRef((props, ref) => (
  <Toast {...props} ref={ref} />
));

const Layout = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: AuthContext is not provided</Text>
      </View>
    );
  }

  const { token, isLoading } = authContext;

  return isLoading ? (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  ) : (
    <>
      <Stack
         screenOptions={{
         headerShown:false
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
      </Stack>
      <ForwardedToast />
    </>
  );
};

const LayoutWithAuthProvider = () => (
  <AuthProvider>
    <Layout />
  </AuthProvider>
);

export default LayoutWithAuthProvider;

const styles = StyleSheet.create({});