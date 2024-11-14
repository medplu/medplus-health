import React from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessionalHeader from './ProfessionalHeader'; 
import ProfessionalTabs from './tabs';
import EditProfileScreen from './EditProfileScreen';
import AccountsScreen from './AccountsScreen';

const Stack = createNativeStackNavigator();

const ProfessionalLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ProfessionalHeader />
      <View style={styles.innerContainer}>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={ProfessionalTabs} options={{ headerShown: false }} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Edit Profile' }} />
          <Stack.Screen name="AccountSettings" component={AccountsScreen} options={{ headerShown: true, title: 'Account Settings' }} />
        </Stack.Navigator>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
});

export default ProfessionalLayout;