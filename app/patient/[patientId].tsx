import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { selectUser } from '../store/userSlice';
import { fetchPatientById, selectPatientById, selectPatientLoading, selectPatientError } from '../store/patientSlice';
import { AppDispatch } from '../store/configureStore';

interface RootState {
  patient: any; // Update with actual type
  user: any; // Update with actual type
}

const PatientDetails: React.FC = () => {
  const { patientId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedSegment, setSelectedSegment] = useState('prescriptions');
  const [notes, setNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: '',
    description: '',
    referral: '',
    medication: '',
    instructions: '',
    refills: '',
    warnings: '',
  });
  const [drugSuggestions, setDrugSuggestions] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleSaveNotes = () => {
    // Dispatch action to save notes
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddEntry = async () => {
    if (selectedSegment === 'prescriptions') {
      const formData = new FormData();
      formData.append('patientId', patientId as string);
      formData.append('doctorId', user.professional?._id as string);
      formData.append('dateIssued', new Date().toISOString());
      formData.append('medication', JSON.stringify([{
        drugName: newEntry.medication,
        strength: '500 mg', // Example value, should be dynamic
        dosageForm: 'tablet', // Example value, should be dynamic
        quantity: 30, // Example value, should be dynamic
      }]));
      formData.append('instructions', JSON.stringify({
        dosageAmount: '1 tablet', // Example value, should be dynamic
        route: 'orally', // Example value, should be dynamic
        frequency: 'every 8 hours', // Example value, should be dynamic
        duration: 'for 7 days', // Example value, should be dynamic
        additionalInstructions: newEntry.instructions,
      }));
      formData.append('refills', newEntry.refills);
      formData.append('prescriber', JSON.stringify({
        name: user.name,
        licenseNumber: '123456', // Example value, should be dynamic
        contact: {
          phone: '123-456-7890', // Example value, should be dynamic
          address: '123 Main St', // Example value, should be dynamic
        },
      }));
      formData.append('warnings', newEntry.warnings);
      formData.append('patient', JSON.stringify({
        name: patient?.name || 'Unnamed Patient',
        dob: patient?.dob || new Date(), // Example value, should be dynamic
        weight: patient?.weight || 70, // Example value, should be dynamic
      }));

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      try {
        const response = await fetch('https://medplus-health.onrender.com/api/prescriptions', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to create prescription');
        }

        const savedPrescription = await response.json();
        // Update the state or dispatch an action to update the store
      } catch (error) {
        console.error('Error creating prescription:', error);
      }
    }

    // Reset the newEntry state after submission
    setNewEntry({ type: '', description: '', referral: '', medication: '', instructions: '', refills: '', warnings: '' });
    setSelectedFile(null);
    setModalVisible(false);
  };

  // Fetch drug suggestions from the FDA API
  const fetchDrugSuggestions = async (query: string) => {
    if (query.length < 3) {
      setDrugSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${query}&limit=10`);
      const data = await response.json();
      const suggestions = data.results.map((item: any) => item.openfda.brand_name[0]);
      setDrugSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching drug suggestions:', error);
    }
  };

  const handleDrugSelection = (suggestion: string) => {
    setNewEntry({ ...newEntry, medication: suggestion });
    setDrugSuggestions([]);
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
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: patient?.image || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileText}>{patient?.name || 'Unnamed Patient'}</Text>
        <Text style={styles.profileText}>Age: {patient?.age || 'N/A'}</Text>
        {patient?.diagnosis && (
          <Text style={styles.profileText}>Diagnosis: {patient.diagnosis}</Text>
        )}
        <Button title="Refer to Clinic" onPress={() => setModalVisible(true)} />
      </View>

      <View style={styles.tabContainer}>
        {['prescriptions', 'labs', 'notes'].map(segment => (
          <TouchableOpacity
            key={segment}
            onPress={() => handleSegmentChange(segment)}
            style={[styles.tabCard, selectedSegment === segment && styles.selectedTabCard]}
          >
            <Text style={selectedSegment === segment ? styles.selectedTab : styles.tab}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedSegment === 'notes' ? (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Add your notes here..."
          />
          <Button title="Save Notes" onPress={handleSaveNotes} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Text>
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
          <Button title={`Add New ${selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}`} onPress={() => setModalVisible(true)} />
        </View>
      )}

      <Button title="Go Back" onPress={() => router.back()} />

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New {selectedSegment.charAt(0).toUpperCase() + selectedSegment.slice(1)}</Text>
          {selectedSegment === 'prescriptions' ? (
            <>
              <TextInput
                style={styles.modalInput}
                placeholder="Medication"
                value={newEntry.medication}
                onChangeText={text => {
                  setNewEntry({ ...newEntry, medication: text });
                  fetchDrugSuggestions(text);
                }}
              />
              {drugSuggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {drugSuggestions.map((suggestion, index) => (
                    <TouchableOpacity key={index} onPress={() => handleDrugSelection(suggestion)}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.modalInput}
                placeholder="Instructions"
                value={newEntry.instructions}
                onChangeText={text => setNewEntry({ ...newEntry, instructions: text })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Refills"
                value={newEntry.refills}
                onChangeText={text => setNewEntry({ ...newEntry, refills: text })}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Warnings"
                value={newEntry.warnings}
                onChangeText={text => setNewEntry({ ...newEntry, warnings: text })}
              />
              <input type="file" onChange={handleFileChange} />
            </>
          ) : selectedSegment === 'referrals' ? (
            <TextInput
              style={styles.modalInput}
              placeholder="Refer to clinic"
              value={newEntry.referral}
              onChangeText={text => setNewEntry({ ...newEntry, referral: text })}
            />
          ) : (
            <TextInput
              style={styles.modalInput}
              placeholder="Description"
              value={newEntry.description}
              onChangeText={text => setNewEntry({ ...newEntry, description: text })}
            />
          )}
          <Button title="Save Entry" onPress={handleAddEntry} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  tabCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  selectedTabCard: {
    backgroundColor: '#e0e0e0',
  },
  tab: {
    fontSize: 16,
    color: '#007BFF',
  },
  selectedTab: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  notesContainer: {
    marginVertical: 16,
  },
  notesInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
  },
  suggestionText: {
    padding: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
});

export default PatientDetails;
