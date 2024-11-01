import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';

const Notifications = () => {
  const { appointments = [], loading, error } = useAppointments();
  
  const router = useRouter();

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  const renderAppointmentItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentText}>
        Appointment with {item.patientName} on {item.date} at {item.time}
      </Text>
      <Text style={styles.statusText}>Status: {item.status}</Text> {/* Display status */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleViewAppointment(item._id)}
      >
        <Text style={styles.buttonText}>View Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments</Text>
      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments available.</Text>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointmentItem}
          keyExtractor={(item) => item._id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  appointmentCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
  },
  appointmentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  statusText: { // New style for status
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default Notifications;
