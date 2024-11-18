import React from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PharmacyHeader from './PharmacistHeader'; 
import PharmacyTabs from './tabs';
import DrugScreen from './DrugScreen';

const Stack = createNativeStackNavigator();

const PharmacyLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <PharmacyHeader />
      <View style={styles.innerContainer}>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" component={PharmacyTabs} options={{ headerShown: false }} />
          <Stack.Screen name="DrugScreen" component={DrugScreen} options={{ headerShown: true, title: 'Drugs' }} />
         
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

export default PharmacyLayout;