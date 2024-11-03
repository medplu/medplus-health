import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { selectUser } from '../store/userSlice';
import { fetchPatientById, selectPatientById, selectPatientLoading, selectPatientError } from '../store/patientSlice';
import { AppDispatch } from '../store/configureStore';

interface RootState {
  patient: any; // Update with actual type
  user: any; // Update with actual type
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  image: string;
  email: string;
  bio: string;
  prescriptions: string[];
  diagnoses: string[];
  treatment: string[];
  labTests: string[];
  // Add other patient details as needed
}

const PatientDetails: React.FC = () => {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedSegment, setSelectedSegment] = useState('prescriptions');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Retrieve patient and user data from Redux
  const patient = useSelector((state: RootState) => selectPatientById(state, patientId as string));
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);
  const user = useSelector(selectUser);

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
      <View style={styles.header}>
        <Image source={{ uri: user?.profileImage || 'placeholder_image_url' }} style={styles.userImage} />
        <Text style={styles.userName}>{user?.name}</Text>
      </View>

      <Text style={styles.title}>Patient Details</Text>

      <View style={styles.profileSection}>
        <Image source={{ uri: patient?.image }} style={styles.profileImage} />
        <Text style={styles.profileText}>Name: {patient?.name}</Text>
        <Text style={styles.profileText}>Age: {patient?.age}</Text>
        <Text style={styles.profileText}>Bio: {patient?.bio}</Text>
      </View>

      <View style={styles.horizontalCardContainer}>
        <TouchableOpacity style={styles.horizontalCard} onPress={() => router.push('/patient/MedicalHistory')}>
          <Text style={styles.horizontalCardText}>Medical History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.horizontalCard} onPress={() => {/* Implement request labs/images */}}>
          <Text style={styles.horizontalCardText}>Labs/Images</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.horizontalCard} onPress={() => {/* Implement refer to clinic */}}>
          <Text style={styles.horizontalCardText}>Refer to Clinic</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  profileText: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  horizontalCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  horizontalCard: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    flex: 1,
    alignItems: 'center',
  },
  horizontalCardText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
    elevation: 3,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dataText: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 2,
  },
  noInfoText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
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