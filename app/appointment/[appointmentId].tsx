import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Updated import
import { useSelector } from 'react-redux';
import { Card, IconButton, Button, Modal } from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';
import useFetchPrescription from '../hooks/useFetchPrescription';

const AppointmentDetails = () => {
  const { appointmentId } = useLocalSearchParams();
  const router = useRouter(); // Use Expo Router's router

  const appointment = useSelector((state: RootState) => 
    state.appointments.appointments.find(a => a._id === appointmentId)
  );

  const patientId = appointment?.patientId?._id;
  
  const { loading, error } = useFetchPrescription(patientId, appointmentId); // Pass appointmentId
  
  const prescription = useSelector((state: RootState) => state.prescription);
  
  const [activeSection, setActiveSection] = useState<'notes' | 'labResults' | null>(null);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);

  const handlePrescriptionIconPress = () => {
    if (prescription) {
      router.push('/PrescriptionScreen'); // Remove params
    } else {
      Alert.alert('No prescription available');
    }
  };

  if (!appointment) {
    return (
      <View style={styles.errorContainer}>
        <Text>Appointment data not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Appointment Details</Text>
      <View style={styles.profileSection}>
        {appointment.doctorId?.profileImage && (
          <Image source={{ uri: appointment.doctorId.profileImage }} style={styles.profileImage} />
        )}
        <View style={styles.doctorInfo}>
          <Text style={styles.text}>
            Dr. {appointment.doctorId ? `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}` : 'N/A'}
          </Text>
          <Text style={styles.text}>{appointment.doctorId?.email || 'N/A'}</Text>
          <Text style={styles.text}>{appointment.doctorId?.profession || 'N/A'}</Text>
        </View>
      </View>

      <Card style={styles.appointmentCard}>
        <Card.Title title="Appointment Details" left={() => <MaterialIcons name="event" size={24} color="black" />} />
        <Card.Content>
          <View style={styles.detailRow}>
            <MaterialIcons name="date-range" size={20} color="grey" />
            <Text style={styles.cardText}>Date: {appointment.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={20} color="grey" />
            <Text style={styles.cardText}>Time: {appointment.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={20} color="grey" />
            <Text style={styles.cardText}>Status: {appointment.status}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsRow}>
        <IconButton
          icon={() => <FontAwesome5 name="prescription-bottle-alt" size={24} color="#4CAF50" />}
          size={30}
          onPress={handlePrescriptionIconPress}
        />
        <IconButton
          icon={() => <FontAwesome5 name="flask" size={24} color="#2196F3" />}
          size={30}
          onPress={() => setActiveSection(activeSection === 'labResults' ? null : 'labResults')}
        />
        <IconButton
          icon={() => <MaterialIcons name="note" size={24} color="#FF9800" />}
          size={30}
          onPress={() => setActiveSection(activeSection === 'notes' ? null : 'notes')}
        />
      </View>

      {activeSection === 'notes' && (
        <View style={[styles.section, styles.notesSection]}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text>{appointment.notes || 'No notes available.'}</Text>
        </View>
      )}

      {activeSection === 'labResults' && (
        <View style={[styles.section, styles.labSection]}>
          <Text style={styles.sectionTitle}>Lab Results</Text>
          <Text>{appointment.labResults || 'No lab results available.'}</Text>
        </View>
      )}

      <Modal
        visible={prescriptionModalVisible}
        onDismiss={() => setPrescriptionModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {loading ? (
          <Text>Loading prescription...</Text>
        ) : prescription ? (
          <PrescriptionTemplate prescription={prescription} />
        ) : (
          <Text>No prescription available</Text>
        )}
        <Button onPress={() => setPrescriptionModalVisible(false)} style={styles.closeButton}>Close</Button>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#feffdf',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  doctorInfo: {
    flex: 1,
  },
  appointmentCard: {
    marginBottom: 20,
    backgroundColor: '#fffde7',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  cardText: {
    marginLeft: 10,
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesSection: {
    backgroundColor: '#e3f2fd',
  },
  labSection: {
    backgroundColor: '#fce4ec',
    padding: 10,
    borderRadius: 8,
  },
  modalContainer: {
    padding: 16,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default AppointmentDetails;
