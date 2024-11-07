import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, StyleSheet, FlatList, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { selectUser } from '../store/userSlice';
import { fetchPatientById, selectPatientById, selectPatientLoading, selectPatientError } from '../store/patientSlice';
import { AppDispatch } from '../store/configureStore';
import { Text, Button, TextInput, Modal, Card, Title, Paragraph, ActivityIndicator, Snackbar } from 'react-native-paper';
import Colors from '@/components/Shared/Colors';

interface RootState {
  patient: any; 
  user: any; 
}

const PatientDetails: React.FC = () => {
  const { patientId } = useLocalSearchParams(); // Get patientId from URL parameters
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedSegment, setSelectedSegment] = useState('prescriptions');
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState({
    medication: '',
    strength: '',
    dosageForm: '',
    quantity: '',
    dosageAmount: '',
    route: '',
    frequency: '',
    duration: '',
    instructions: '',
    refills: '',
    warnings: '',
  });
  const [medications, setMedications] = useState([{
    drugName: '',
    strength: '',
    dosageForm: '',
    quantity: '',
  }]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const patient = useSelector((state: RootState) => selectPatientById(state, patientId as string));
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);
  const user = useSelector(selectUser); // Get the current user from the Redux store

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId as string));
    }
  }, [dispatch, patientId]);

  const handleSegmentChange = (segment: string) => {
    setSelectedSegment(segment);
  };

  const handleAddMedication = () => {
    setMedications([...medications, { drugName: '', strength: '', dosageForm: '', quantity: '' }]);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const newMedications = medications.map((medication, i) => {
      if (i === index) {
        return { ...medication, [field]: value };
      }
      return medication;
    });
    setMedications(newMedications);
  };

  const handleAddEntry = async () => {
    if (selectedSegment === 'prescriptions') {
      const formData = {
        patientId: patientId as string, // Use patientId from URL parameters
        doctorId: user.professional?._id as string, // Use doctorId from the current user in the Redux store
        medication: medications,
        instructions: { 
          dosageAmount: newEntry.dosageAmount,
          route: newEntry.route,
          frequency: newEntry.frequency, 
          duration: newEntry.duration, 
          additionalInstructions: newEntry.instructions,
        },
        refills: newEntry.refills,
        warnings: newEntry.warnings,
      };

      try {
        const response = await fetch('https://medplus-health.onrender.com/api/prescriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create prescription');
        }

        const { prescription } = await response.json();
        const pdfResponse = await fetch(`https://medplus-health.onrender.com/api/prescriptions/${prescription._id}/pdf`);
        const { pdfUrl } = await pdfResponse.json();
        Linking.openURL(pdfUrl); // Use Linking to open the PDF URL
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error creating prescription:', error);
      }
    }

    setNewEntry({ medication: '', strength: '', dosageForm: '', quantity: '', dosageAmount: '', route: '', frequency: '', duration: '', instructions: '', refills: '', warnings: '' });
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
        <Text style={styles.loadingText}>Loading patient data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchPatientById(patientId as string))}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.profileSection}>
        <Card.Content style={styles.profileContent}>
          <Image
            source={{ uri: patient?.image || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
            style={styles.profileImage}
          />
          <View>
            <Title>{patient?.name || 'Unnamed Patient'}</Title>
            <Paragraph>Age: {patient?.age || 'N/A'}</Paragraph>
            {patient?.diagnosis && (
              <Paragraph>Diagnosis: {patient.diagnosis}</Paragraph>
            )}
          </View>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => setModalVisible(true)}>Refer to Clinic</Button>
        </Card.Actions>
      </Card>

      <View style={styles.tabContainer}>
        {['prescriptions', 'labs', 'notes'].map(segment => (
          <Button
            key={segment}
            mode={selectedSegment === segment ? 'contained' : 'outlined'}
            onPress={() => handleSegmentChange(segment)}
            style={styles.tabButton}
          >
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </Button>
        ))}
      </View>

      {selectedSegment === 'notes' ? (
        <View style={styles.notesContainer}>
          <TextInput
            mode="outlined"
            multiline
            placeholder="Add your notes here..."
            style={styles.notesInput}
          />
          <Button mode="contained" onPress={() => {}}>Save Notes</Button>
        </View>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title>{selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Title>
            <FlatList
              data={patient ? patient[selectedSegment as keyof typeof patient] : []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.entryContainer}>
                  <Text style={styles.entryTitle}>{item.type || 'Entry'}</Text>
                  <Text style={styles.dataText}>{item.description || item.result || 'No details provided'}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.noInfoText}>No data available.</Text>}
            />
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => setModalVisible(true)}>Add New {selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Button>
          </Card.Actions>
        </Card>
      )}

      <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>Go Back</Button>

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.modalTitle}>Add New {selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Title>
        {selectedSegment === 'prescriptions' && (
          <View style={styles.formContainer}>
            {medications.map((medication, index) => (
              <View key={index} style={styles.medicationContainer}>
                <View style={styles.row}>
                  <TextInput
                    mode="outlined"
                    label="Medication"
                    placeholder="Medication"
                    value={medication.drugName}
                    onChangeText={text => handleMedicationChange(index, 'drugName', text)}
                    style={styles.modalInput}
                  />
                  <TextInput
                    mode="outlined"
                    label="Strength"
                    placeholder="Strength"
                    value={medication.strength}
                    onChangeText={text => handleMedicationChange(index, 'strength', text)}
                    style={styles.modalInput}
                  />
                </View>
                <View style={styles.row}>
                  <TextInput
                    mode="outlined"
                    label="Dosage Form"
                    placeholder="Dosage Form"
                    value={medication.dosageForm}
                    onChangeText={text => handleMedicationChange(index, 'dosageForm', text)}
                    style={styles.modalInput}
                  />
                  <TextInput
                    mode="outlined"
                    label="Quantity"
                    placeholder="Quantity"
                    value={medication.quantity}
                    onChangeText={text => handleMedicationChange(index, 'quantity', text)}
                    style={styles.modalInput}
                  />
                </View>
              </View>
            ))}
            <Button mode="outlined" onPress={handleAddMedication} style={styles.addButton}>Add Another Medication</Button>
            <View style={styles.row}>
              <TextInput
                mode="outlined"
                label="Frequency"
                placeholder="Frequency"
                value={newEntry.frequency}
                onChangeText={text => setNewEntry({ ...newEntry, frequency: text })}
                style={styles.modalInput}
              />
              <TextInput
                mode="outlined"
                label="Duration"
                placeholder="Duration"
                value={newEntry.duration}
                onChangeText={text => setNewEntry({ ...newEntry, duration: text })}
                style={styles.modalInput}
              />
            </View>
          </View>
        )}
        <Button mode="contained" onPress={handleAddEntry} style={styles.saveButton}>Save Entry</Button>
        <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>Cancel</Button>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        Prescription created successfully!
      </Snackbar>
    </View>
  );
};

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.white,
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
  profileSection: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  notesContainer: {
    marginVertical: 16,
  },
  notesInput: {
    height: 100,
    marginBottom: 8,
  },
  card: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entryContainer: {
    marginBottom: 12,
    paddingVertical: 10,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  noInfoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
  modalContainer: {
    padding: 16,
    backgroundColor: Colors.light_gray,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formGroup: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  addButton: {
    marginVertical: 16,
  },
  saveButton: {
    marginTop: 16,
  },
  cancelButton: {
    marginTop: 8,
  },
  medicationContainer: {
    marginBottom: 16,
  },
});

export default PatientDetails;
