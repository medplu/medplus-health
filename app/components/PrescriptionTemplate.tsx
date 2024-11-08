import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrescriptionTemplate = ({ prescription }) => {
  console.log('Rendering PrescriptionTemplate with data:', prescription); // Debugging log

  if (!prescription) {
    return (
      <View style={styles.errorContainer}>
        <Text>No prescription data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Prescription for: {prescription.patientId.name}</Text>
      <Text>Issued by: {prescription.doctorId.firstName} {prescription.doctorId.lastName}</Text>
      <Text>Date Issued: {new Date(prescription.dateIssued).toLocaleDateString()}</Text>
      <Text>Medications:</Text>
      {prescription.medication.map((med, index) => (
        <View key={med._id} style={styles.medicationItem}>
          <Text>{med.drugName} - {med.strength}</Text>
          <Text>Frequency: {med.frequency}</Text>
          <Text>Duration: {med.duration}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationItem: {
    marginVertical: 8,
  },
});

export default PrescriptionTemplate;
