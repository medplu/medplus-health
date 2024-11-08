import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PrescriptionScreen = () => {
  const navigation = useNavigation();
  const prescription = useSelector((state: RootState) => state.prescription);

  console.log('Current prescription state:', prescription); // Debugging log

  if (!prescription) {
    return (
      <View style={styles.errorContainer}>
        <Text>No prescription data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <PrescriptionTemplate prescription={prescription} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1, // Ensure the button is above other elements
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: Add background for better visibility
    borderRadius: 16, // Optional: Make the button circular
    padding: 4, // Optional: Add padding around the icon
  },
});

export default PrescriptionScreen;
