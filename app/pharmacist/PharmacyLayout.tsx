import React from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import PharmacyHeader from './PharmacistHeader'; 
import PharmacyTabs from './tabs';
import DrugScreen from './DrugScreen';
import PrescriptionDetails from './PrescriptionDetails';
import PrescriptionList from './PrescriptionList';
import Cart from './Cart';

const PharmacyLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PharmacyHeader />
      <View style={styles.innerContainer}>
        <Stack>
          <Stack.Screen name="Tabs" options={{ headerShown: false }} />
          <Stack.Screen name="DrugScreen" options={{ headerShown: true, title: 'Drugs' }} />
          <Stack.Screen name="PrescriptionList" options={{headerShown: true}} />
          <Stack.Screen name="PrescriptionDetails" options={{headerShown: true}}/>
          <Stack.Screen name="Cart" />
        </Stack>
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

export default PharmacyLayout;