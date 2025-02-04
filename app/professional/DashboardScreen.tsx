import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image, TextInput, Modal, Button, FlatList } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../store/userSlice';
import { useNavigation, useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSchedule from '../../hooks/useSchedule';
import { useRoute } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const route = useRoute();
  const user = useSelector(selectUser);
  const { appointments, loading, error } = useAppointments();
  const professionalId = user.professional?._id;
  const { schedule, fetchSchedule } = useSchedule();
  const [tasks, setTasks] = useState<{ description: string, startTime: string, endTime: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login');
    }
  }, [user.isLoggedIn]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('@tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks.', e);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to save tasks.', e);
      }
    };
    saveTasks();
  }, [tasks]);

  useEffect(() => {
    if (professionalId) {
      setScheduleLoading(true);
      fetchSchedule(professionalId)
        .catch((error) => setScheduleError(error.message))
        .finally(() => setScheduleLoading(false));
    }
  }, [professionalId]);

  useEffect(() => {
    if (route.params?.showTaskModal) {
      setModalVisible(true);
    }
  }, [route.params]);

  const addTask = (description: string, startTime: string, endTime: string) => {
    setTasks([...tasks, { description, startTime, endTime }]);
  };

  const handleViewPatient = (patientId: string, appointmentId: string) => {
    router.push(`/patient/${patientId}?appointmentId=${appointmentId}`);
  };

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.date && moment(appointment.date);
    return (
      (appointment.status === 'confirmed' || appointment.status === 'pending') &&
      appointmentDate && appointmentDate.isSame(moment(), 'day')
    );
  });
  const requestedAppointments = appointments.filter(appointment => appointment.status === 'requested');
  const completedAppointments = appointments.filter(appointment => appointment.status === 'completed');

  if (loading || scheduleLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || scheduleError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || scheduleError}</Text>
      </View>
    );
  }

  const renderOverviewCards = () => {
    const cardData = [
      { title: 'Total Appointments', count: totalAppointments, color: '#ff7f50' },
      { title: 'Upcoming', count: upcomingAppointments.length, color: '#4CAF50' },
      { title: 'Requested', count: requestedAppointments.length, color: '#2196F3' },
      { title: 'Completed', count: completedAppointments.length, color: '#f44336' },
    ];

    return (
      <View style={styles.cardsContainer}>
        {cardData.map((card, index) => (
          <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardCount}>{card.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOverviewList = () => {
    const today = moment().format('YYYY-MM-DD');
    const todaySlots = schedule.filter(slot => moment(slot.date).format('YYYY-MM-DD') === today && slot.isBooked);

    return (
      <View style={styles.listContainer}>
        {todaySlots.length > 0 ? (
          todaySlots.map((slot, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{`${slot.startTime} - ${slot.endTime}`}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSlotsText}>No booked slots for today.</Text>
        )}
      </View>
    );
  };

  const renderTaskItem = ({ item, index }: { item: { description: string, startTime: string, endTime: string }, index: number }) => (
    <View style={styles.taskItem}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        {index < tasks.length - 1 && <View style={styles.line} />}
      </View>
      <View style={styles.taskDetails}>
        <Text style={styles.taskText}>{item.description}</Text>
        <Text style={styles.taskTime}>{item.startTime} - {item.endTime}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {user.isLoggedIn ? (
        <>
          <View style={styles.overviewContainer}>
            <View style={styles.overviewHeader}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.iconContainer}>
                {upcomingAppointments.length > 0 && (
                  <View style={styles.badge} />
                )}
                <Icon name="calendar" size={24} color="#333" style={styles.icon} />
              </View>
            </View>

            <View style={styles.overviewCard}>
              <TouchableOpacity
                style={styles.overviewItem}
                onPress={() => router.push('/tasks')}
              >
                <Icon name="tasks" size={24} color="#ff7f50" style={styles.icon} />
                <Text style={styles.overviewLabel}>Tasks ({tasks.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.overviewItem}>
                <Icon name="money" size={24} color="#4CAF50" style={styles.icon} />
                <Text style={styles.overviewLabel}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.overviewItem}>
                <Icon name="calendar" size={24} color="#f44336" style={styles.icon} />
                <Text style={styles.overviewLabel}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.overviewItem}
                onPress={() => router.push('/consultations')}
              >
                <Icon name="users" size={24} color="#2196F3" style={styles.icon} />
                <Text style={styles.overviewLabel}>Patients</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.analyticsContainer}>
            <Text style={styles.sectionTitle}>Appointments Overview</Text>
            {renderOverviewList()}
          </View>

          <View style={styles.upcomingContainer}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => {
                const appointmentDate = moment(appointment.date).calendar(null, {
                  sameDay: '[Today]',
                  nextDay: '[Tomorrow]',
                  nextWeek: 'dddd',
                  sameElse: 'MMMM D, YYYY'
                });

                return (
                  <View key={appointment._id} style={styles.appointmentCard}>
                    <View style={styles.appointmentDetails}>
                      <Text style={styles.patientName}>{appointment.patientName}</Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                      <Text style={styles.appointmentDate}>{appointmentDate}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewPatient(appointment.patientId._id, appointment._id)}
                    >
                      <Text style={styles.buttonText}>View Patient</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noAppointmentsText}>No upcoming appointments.</Text>
            )}
          </View>

          <View style={styles.tasksContainer}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>Your Tasks</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Icon name="plus" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            {tasks.length > 0 ? (
              <FlatList
                data={tasks}
                renderItem={renderTaskItem}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <Text style={styles.noTasksText}>No tasks available.</Text>
            )}
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Task</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task"
                  value={newTask}
                  onChangeText={setNewTask}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Start Time (HH:mm)"
                  value={startTime}
                  onChangeText={setStartTime}
                />
                <TextInput
                  style={styles.input}
                  placeholder="End Time (HH:mm)"
                  value={endTime}
                  onChangeText={setEndTime}
                />
                <Button
                  title="Add Task"
                  onPress={() => {
                    if (newTask.trim() && startTime.trim() && endTime.trim()) {
                      addTask(newTask.trim(), startTime.trim(), endTime.trim());
                      setNewTask('');
                      setStartTime('');
                      setEndTime('');
                      setModalVisible(false);
                    }
                  }}
                />
                <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.loginPrompt}>Please log in to see your dashboard.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
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
  overviewContainer: {
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 8,
    height: 8,
    backgroundColor: '#f44336',
    borderRadius: 4,
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  overviewItem: {
    alignItems: 'center',
    padding: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
  },
  analyticsContainer: {
    marginBottom: 20,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    marginTop: 10,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#555',
  },
  viewButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  tasksContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff7f50',
    marginTop: 5,
  },
  line: {
    width: 2,
    height: 50,
    backgroundColor: '#ff7f50',
    marginTop: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  taskTime: {
    fontSize: 14,
    color: '#555',
  },
  noTasksText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});

export default DashboardScreen;

