import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

const PatientDetails: React.FC = () => {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const [selectedSegment, setSelectedSegment] = useState('prescriptions');

  const dummyProfile = {
    image: 'https://via.placeholder.com/150',
    gender: 'Male',
    email: 'patient@example.com',
  };

  const dummyAppointment = {
    date: '2023-10-01',
    time: '10:00 AM',
    doctor: 'Dr. Smith',
  };

  const dummyData = {
    prescriptions: ['Prescription 1', 'Prescription 2'],
    diagnoses: ['Diagnosis 1', 'Diagnosis 2'],
    treatment: ['Treatment 1', 'Treatment 2'],
    labTests: ['Lab Test 1', 'Lab Test 2'],
  };

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Details</Text>
      <Text style={styles.patientId}>Patient ID: {patientId}</Text>

      <View style={styles.profileSection}>
        <Image source={{ uri: dummyProfile.image }} style={styles.profileImage} />
        <Text>Gender: {dummyProfile.gender}</Text>
        <Text>Email: {dummyProfile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        {dummyAppointment ? (
          <View>
            <Text>Date: {dummyAppointment.date}</Text>
            <Text>Time: {dummyAppointment.time}</Text>
            <Text>Doctor: {dummyAppointment.doctor}</Text>
          </View>
        ) : (
          <Text>No information provided</Text>
        )}
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity onPress={() => handleSegmentChange('prescriptions')}>
          <Text style={selectedSegment === 'prescriptions' ? styles.selectedSegment : styles.segment}>Prescriptions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSegmentChange('diagnoses')}>
          <Text style={selectedSegment === 'diagnoses' ? styles.selectedSegment : styles.segment}>Diagnoses</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSegmentChange('treatment')}>
          <Text style={selectedSegment === 'treatment' ? styles.selectedSegment : styles.segment}>Treatment</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSegmentChange('labTests')}>
          <Text style={selectedSegment === 'labTests' ? styles.selectedSegment : styles.segment}>Lab Tests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Text>
        <FlatList
          data={dummyData[selectedSegment]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text>{item}</Text>}
        />
      </View>

      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  patientId: {
    fontSize: 18,
    color: '#333',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 8,
  },
  section: {
    marginVertical: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  segment: {
    fontSize: 18,
    color: '#007BFF',
  },
  selectedSegment: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default PatientDetails;