import { StyleSheet, Text, View, Image, ActivityIndicator, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import moment from 'moment'; // To handle date formatting
import { MaterialIcons } from '@expo/vector-icons'; // Importing icons from Material Icons
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import io, { Socket } from 'socket.io-client'; // Import socket.io-client
import PushNotification from 'react-native-push-notification'; // Import react-native-push-notification
import { CircularProgress } from 'react-native-svg-circular-progress'; // Import CircularProgress
import AddClinicForm from '../../components/AddClinicForm'; // Import AddClinicForm component

interface Appointment {
  _id: string;
  patientName: string;
  patientImage?: string;
  date: string;
  time: string;
  status: string;
}

interface Day {
  label: string;
  date: string;
  isToday: boolean;
}

const DashboardScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const totalAppointments = appointments.length + recentAppointments.length;
  const completedAppointments = recentAppointments.length;
  const progress = calculateProgress(completedAppointments, totalAppointments);
  const [showAddClinicForm, setShowAddClinicForm] = useState(false);

  const handleAddClinicClick = () => {
    setShowAddClinicForm(true);
  };

  const handleCloseForm = () => {
    setShowAddClinicForm(false);
  };

  // Connect to WebSocket server
  const socket: Socket = io('http://localhost:3000');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctorId'); // Retrieve doctorId from AsyncStorage
        if (!doctorId) {
          throw new Error('Doctor ID not found in AsyncStorage');
        }

        // Fetch upcoming appointments
        const upcomingResponse = await fetch(`http://localhost:3000/api/appointments/doctor/${doctorId}`);
        const upcomingData: Appointment[] = await upcomingResponse.json();

        // Fetch all appointments
        const allResponse = await fetch(`http://localhost:3000/api/appointments/doctor/${doctorId}/all`);
        const allData: Appointment[] = await allResponse.json();

        // Filter for upcoming appointments
        const upcomingAppointments = upcomingData.filter(appointment => 
          moment(appointment.date).isSameOrAfter(moment(), 'day') && appointment.status === 'booked'
        );

        // Filter for recent (overdue) appointments
        const overdueAppointments = allData.filter(appointment => 
          moment(appointment.date).isBefore(moment(), 'day')
        );

        setAppointments(upcomingAppointments);
        setRecentAppointments(overdueAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Listen for new appointments
    socket.on('newAppointment', (appointment: Appointment) => {
      setAppointments(prevAppointments => [...prevAppointments, appointment]);
      PushNotification.localNotification({
        title: 'New Appointment',
        message: `New appointment with ${appointment.patientName} on ${moment(appointment.date).format('MMMM Do YYYY')} at ${appointment.time}`,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const confirmAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/appointments/confirm/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Appointment confirmed successfully');
        // Update state to reflect the confirmed status
        setAppointments(prevAppointments =>
          prevAppointments.map(appointment =>
            appointment._id === appointmentId
              ? { ...appointment, status: 'confirmed' }
              : appointment
          )
        );
      } else {
        throw new Error('Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      Alert.alert('Error', 'Could not confirm the appointment');
    }
  };

  const today = moment(); // Get today's date
  const startOfWeek = today.startOf('isoWeek'); // Get the start of the week (Monday)

  // Create an array to hold the days of the week
  const days: Day[] = [];
  for (let i = 0; i < 7; i++) {
    const day = startOfWeek.clone().add(i, 'days'); // Get each day of the week
    days.push({
      label: day.format('ddd'), // Day initials (Mon, Tue...)
      date: day.format('DD'), // Date
      isToday: day.isSame(today, 'day'), // Check if this day is today
    });
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
        <View style={styles.calendar}>
          {days.map((day) => (
            <View key={day.label} style={styles.dayContainer}>
              <Text style={[styles.dayLabel, day.isToday && styles.todayText]}>
                {day.label}
              </Text>
              <Text style={[styles.dateLabel, day.isToday && styles.todayText]}>
                {day.date}
              </Text>
            </View>
          ))}
        </View>

        {showAddClinicForm ? (
          <AddClinicForm onClose={handleCloseForm} />
        ) : (
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.card} onPress={handleAddClinicClick}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="add" size={40} color="#6200ee" />
              </View>
              <Text style={styles.details}>Add Clinic</Text>
            </TouchableOpacity>
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="schedule" size={40} color="#6200ee" />
              </View>
              <Text style={styles.details}>Schedule</Text>
            </View>
            <View style={styles.card}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="history" size={40} color="#6200ee" />
              </View>
              <Text style={styles.details}>History</Text>
            </View>
          </View>
        )}

        {/* Overview section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardCategories}>
            <Text>Patients</Text>
            <Text>12</Text>
          </View>
          <View style={styles.cardCategories}>
            <Text>Appointments</Text>
            <Text>5</Text>
          </View>
          <View style={styles.cardCategories}>
            <Text>Revenue</Text>
            <Text>$200</Text>
          </View>
        </View>

        {/* Circular Progress Bar for Completed Appointments */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Completed Appointments</Text>
          <CircularProgress
            size={100}
            width={10}
            fill={progress}
            tintColor="#6200ee"
            backgroundColor="#e3e3e3"
          >
            <Text style={styles.progressText}>
              {`${Math.round(progress)}%`}
            </Text>
          </CircularProgress>
        </View>

        {/* Appointment Cards */}
        {appointments.length === 0 ? (
          <Text style={styles.noAppointmentsText}>No upcoming appointments</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment._id} style={styles.appointmentCard}>
              <Image
                source={{ uri: appointment.patientImage || 'https://via.placeholder.com/40' }}
                style={styles.profileImage}
              />
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>{appointment.patientName}</Text>
                <Text style={styles.appointmentTime}>
                  {moment(appointment.date).format('MMMM Do YYYY')} at {appointment.time}
                </Text>
                <View style={styles.actions}>
                  {appointment.status === 'booked' && (
                    <Button title="Confirm" onPress={() => confirmAppointment(appointment._id)} />
                  )}
                  <Button title="Reschedule" onPress={() => console.log('Reschedule pressed')} />
                </View>
              </View>
            </View>
          ))
        )}

        {/* Recent Appointments */}
        <Text style={styles.title}>Recent Appointments</Text>
        {recentAppointments.length === 0 ? (
          <Text style={styles.noAppointmentsText}>No recent appointments</Text>
        ) : (
          recentAppointments.map((appointment) => (
            <View key={appointment._id} style={styles.appointmentCard}>
              <Image
                source={{ uri: appointment.patientImage || 'https://via.placeholder.com/40' }}
                style={styles.profileImage}
              />
              <View style={styles.appointmentDetails}>
                <Text style={styles.patientName}>{appointment.patientName}</Text>
                <Text style={styles.appointmentTime}>
                  {moment(appointment.date).format('MMMM Do YYYY')} at {appointment.time}
                </Text>
                <View style={styles.actions}>
                  <Button title="View" onPress={() => console.log('View pressed')} />
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const calculateProgress = (completed: number, total: number) => {
  return total > 0 ? (completed / total) * 100 : 0;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayContainer: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dateLabel: {
    fontSize: 16,
    color: '#000',
  },
  todayText: {
    color: '#6200ee',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    width: '30%',
    alignItems: 'center',
  },
  cardCategories: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    elevation: 2,
    padding: 20,
  },
  iconContainer: {
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  appointmentTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noAppointmentsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default DashboardScreen;