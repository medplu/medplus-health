import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { selectAppointments } from '../store/appointmentsSlice';

import { Card, IconButton, Button, Modal } from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import PrescriptionTemplate from '@/components/PrescriptionTemplate'; // Ensure correct import path
import { fetchPrescriptionsByPatientId, selectPrescriptions } from '../store/prescriptionSlice';
import { AppDispatch } from '../store/configureStore'; // Import AppDispatch type

const AppointmentDetails = () => {
  const { appointmentId } = useLocalSearchParams(); // Extract appointmentId from route params
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch type
  const appointment = useSelector((state) => 
    state.appointments.appointments.find(a => a._id === appointmentId)
  );
  const prescriptions = useSelector(selectPrescriptions); // Select prescriptions from Redux store

  // Log the appointment data
  console.log('Appointment Details:', appointment);

  const [activeSection, setActiveSection] = useState<'prescription' | 'notes' | 'labResults' | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null); // State for selected prescription

  useEffect(() => {
    if (appointment?.patientId) {
      dispatch(fetchPrescriptionsByPatientId(appointment.patientId)); // Fetch prescriptions for the patient
    }
  }, [dispatch, appointment]);

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

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {appointment.doctorId && appointment.doctorId.profileImage && (
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

      {/* Appointment Details Card */}
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

      {/* Actions Section */}
      <View style={styles.actionsRow}>
        <IconButton
          icon={() => <FontAwesome5 name="prescription-bottle-alt" size={24} color="#4CAF50" />}
          size={30}
          onPress={() => setActiveSection(activeSection === 'prescription' ? null : 'prescription')}
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

      {/* Prescription Section */}
      {activeSection === 'prescription' && (
        <View style={[styles.section, styles.prescriptionSection]}>
          <Text style={styles.sectionTitle}>Prescriptions</Text>
          {prescriptions.length > 0 ? (
            <FlatList
              data={prescriptions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Card style={styles.prescriptionCard}>
                  <Card.Content>
                    <Text style={styles.prescriptionDate}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
                    <Text style={styles.prescriptionDoctor}>Prescribed by: Dr. {item.doctorId.firstName} {item.doctorId.lastName}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button onPress={() => setSelectedPrescription(item)}>View Prescription</Button>
                  </Card.Actions>
                </Card>
              )}
            />
          ) : (
            <Text>No prescriptions available.</Text>
          )}
        </View>
      )}

      {/* Notes Section */}
      {activeSection === 'notes' && (
        <View style={[styles.section, styles.notesSection]}>
          <Text style={styles.sectionTitle}>Notes</Text>
          {appointment.notes ? (
            <Text>{appointment.notes}</Text>
          ) : (
            <Text>No notes available.</Text>
          )}
        </View>
      )}

      {/* Lab Results Section */}
      {activeSection === 'labResults' && (
        <View style={[styles.section, styles.labSection]}>
          <Text style={styles.sectionTitle}>Lab Results</Text>
          {appointment.labResults ? (
            <Text>{appointment.labResults}</Text>
          ) : (
            <Text>No lab results available.</Text>
          )}
        </View>
      )}

      {/* Prescription Modal */}
      <Modal
        visible={!!selectedPrescription}
        onDismiss={() => setSelectedPrescription(null)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedPrescription && <PrescriptionTemplate prescription={selectedPrescription} />}
        <Button onPress={() => setSelectedPrescription(null)} style={styles.closeButton}>Close</Button>
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
  section: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
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
  prescriptionSection: {
    backgroundColor: '#fff3e0',
  },
  prescriptionCard: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  prescriptionDate: {
    fontSize: 14,
    color: '#555',
  },
  prescriptionDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
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

