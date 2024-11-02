import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Added useDispatch
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { selectUser } from '../store/userSlice';
import { selectAppointments } from '../store/appointmentsSlice';
import { fetchPatientById, selectPatientById, selectPatientLoading, selectPatientError } from '../store/patientSlice'; // Imported patient selectors and thunk
import { AppDispatch } from '../store/configureStore'; // Import AppDispatch type

const PatientDetails: React.FC = () => {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Initialize dispatch
  const [selectedSegment, setSelectedSegment] = useState('prescriptions');
  const fadeAnim = useState(new Animated.Value(0))[0]; // Initialize animated value

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Retrieve patient data from Redux
  const patient = useSelector((state: RootState) => selectPatientById(state, patientId as string));
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId as string));
    }
  }, [dispatch, patientId]);

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading patient data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={() => dispatch(fetchPatientById(patientId as string))} />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Patient Details</Text>
      <Text style={styles.patientId}>Patient ID: {patientId}</Text>

      {patient ? ( // Display real patient data
        <View style={styles.card}>
          <View style={styles.profileSection}>
            <Image source={{ uri: patient.image }} style={styles.profileImage} />
            <Text style={styles.profileText}>Gender: {patient.gender}</Text>
            <Text style={styles.profileText}>Email: {patient.email}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noInfoText}>No patient information available.</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Appointment Details</Text>
        {/* Retrieve appointments related to this patient */}
        <FlatList
          data={useSelector((state: RootState) =>
            state.appointments.appointments.filter(app => app.userId === patientId)
          )}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <Text style={styles.appointmentText}>Date: {item.date}</Text>
              <Text style={styles.appointmentText}>Time: {item.time}</Text>
              <Text style={styles.appointmentText}>Doctor: {item.doctor}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noInfoText}>No appointments available.</Text>}
        />
      </View>

      <View style={styles.card}>
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Text>
        <FlatList
          data={patient ? patient[selectedSegment as keyof Patient] as string[] : []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.dataText}>{item}</Text>}
          ListEmptyComponent={<Text style={styles.noInfoText}>No data available.</Text>}
        />
      </View>

      <Button title="Go Back" onPress={() => router.back()} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  patientId: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 8,
  },
  profileText: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segment: {
    fontSize: 16,
    color: '#007BFF',
  },
  selectedSegment: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  appointmentCard: {
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  appointmentText: {
    fontSize: 14,
    color: '#333',
  },
  noInfoText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 8,
  },
});

export default PatientDetails;