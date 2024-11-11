import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfessionalHeader from './ProfessionalHeader'; 
import ProfessionalTabs from './tabs';


const Stack = createNativeStackNavigator();

const ProfessionalLayout = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <ProfessionalHeader />
        <ProfessionalTabs />
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