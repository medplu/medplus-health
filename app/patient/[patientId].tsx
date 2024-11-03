import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, Animated, TextInput, Modal, ScrollView } from 'react-native';
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
  const [newEntry, setNewEntry] = useState({ type: '', description: '', referral: '' });
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const handleAddEntry = () => {
    // Logic to add the entry based on selectedSegment and newEntry
    // Reset the newEntry state after submission
    setNewEntry({ type: '', description: '', referral: '' });
    setModalVisible(false);
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
      <View style={styles.profileSection}>
        <Image 
          source={{ uri: patient?.image || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }} 
          style={styles.profileImage} 
        />
        <Text style={styles.profileText}>{patient?.name || 'Unnamed Patient'}</Text>
        <Text style={styles.profileText}>Age: {patient?.age || 'N/A'}</Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['prescriptions', 'diagnoses', 'treatment', 'labTests', 'notes', 'referrals'].map(segment => (
            <TouchableOpacity 
              key={segment} 
              onPress={() => handleSegmentChange(segment)} 
              style={styles.tabCard}
            >
              <Text style={selectedSegment === segment ? styles.selectedTab : styles.tab}>
                {segment.charAt(0).toUpperCase() + segment.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
            data={patient ? patient[selectedSegment as keyof Patient] : []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.dataText}>{item}</Text>}
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
          {selectedSegment === 'referrals' ? (
            <TextInput
              style={styles.modalInput}
              placeholder="Refer to clinic..."
              value={newEntry.referral}
              onChangeText={text => setNewEntry({ ...newEntry, referral: text })}
            />
          ) : (
            <TextInput
              style={styles.modalInput}
              placeholder={`Enter ${selectedSegment.slice(0, -1)}...`}
              value={newEntry.description}
              onChangeText={text => setNewEntry({ ...newEntry, description: text })}
            />
          )}
          <Button title="Save" onPress={handleAddEntry} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </Animated.View>
  );
};
const styles = StyleSheet.create({
  // Styles remain mostly the same, with additions for new sections
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileText: {
    fontSize: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  tab: {
    fontSize: 16,
    color: '#007BFF',
  },
  selectedTab: {
    fontSize: 16,
    color: '#007BFF',
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 16,
  },

  tabCard: {
    flex: 0, // Set to 0 to prevent flex behavior; width is controlled by the padding
    marginHorizontal: 4, // Adds spacing between the cards
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12, // Vertical padding inside the card
    paddingHorizontal: 16, // Horizontal padding inside the card
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center the text
  },
  
  tabCard: {
    flex: 1,
    marginHorizontal: 4, // Adds spacing between the cards
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12, // Vertical padding inside the card
    paddingHorizontal: 16, // Horizontal padding inside the card
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center the text
  },
  
  tab: {
    fontSize: 16,
    color: '#007BFF',
  },
  
  selectedTab: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  
});

export default PatientDetails;


