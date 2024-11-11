
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessionalHeader from './ProfessionalHeader'; 
import ProfessionalTabs from './tabs';


const Stack = createNativeStackNavigator();

const ProfessionalLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ProfessionalHeader /> 
      <ProfessionalTabs /> 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ProfessionalLayout;