import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';

const Notifications = () => {
  const { appointments = [], loading, error } = useAppointments();
  
  const router = useRouter();

  const handleViewAppointment = (appointmentId: string) => {
    router.push(`/appointment/${appointmentId}`);
  };

  const renderAppointmentItem = ({ item }) => {
    const doctor = item.doctorId || {};
    return (
      <View style={styles.appointmentCard}>
        {doctor.profileImage && (
          <Image source={{ uri: doctor.profileImage }} style={styles.profileImage} />
        )}
        <View>
          <Text style={styles.appointmentText}>
            Appointment with Dr. {doctor.firstName || 'N/A'} {doctor.lastName || 'N/A'}
          </Text>
          <Text style={styles.doctorEmail}>{doctor.email || 'N/A'}</Text>
          <Text style={styles.doctorProfession}>{doctor.profession || 'N/A'}</Text>
          <Text style={styles.timeText}>Time: {item.time}</Text>
          <Text style={styles.statusText}>Status: {item.status}</Text> 
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewAppointment(item._id)}
          >
            <Text style={styles.buttonText}>View Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
    backgroundColor: '#feffdf',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  appointmentText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorEmail: {
    fontSize: 14,
    color: '#555',
  },
  doctorProfession: {
    fontSize: 14,
    color: '#555',
  },
  timeText: {
    fontSize: 14,
    color: '#555',
  },
  statusText: { 
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
