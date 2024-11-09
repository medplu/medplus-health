import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image, TextInput, Modal, Button, FlatList } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../store/userSlice';
import { RootState } from '../store/configureStore';
import { useRouter } from 'expo-router';
import useAppointments from '../../hooks/useAppointments';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const user = useSelector(selectUser);
  const { appointments, loading, error } = useAppointments();
  const [dummyData, setDummyData] = useState<any[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');

  useEffect(() => {
    // Fetch or generate dummy data
    const data = [
      { id: 1, name: 'John Doe', date: '2023-10-01', time: '10:00 AM', status: 'confirmed' },
      { id: 2, name: 'Jane Smith', date: '2023-10-01', time: '11:00 AM', status: 'pending' },
      // ... more dummy data
    ];
    setDummyData(data);
  }, []);

  useEffect(() => {
    // Load tasks from AsyncStorage
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
    // Save tasks to AsyncStorage
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to save tasks.', e);
      }
    };
    saveTasks();
  }, [tasks]);

  const addTask = (task: string) => {
    setTasks([...tasks, task]);
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

  useEffect(() => {
    console.log('All Appointments:', appointments);
    console.log('Upcoming Appointments:', upcomingAppointments);
  }, [appointments, upcomingAppointments]);

  const requestedAppointments = appointments.filter(appointment => appointment.status === 'requested');
  const completedAppointments = appointments.filter(appointment => appointment.status === 'completed');

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

  const renderHeader = () => {
    const now = moment();
    const upcomingAppointment = upcomingAppointments.find(
      (appointment) => appointment.status === 'confirmed' && moment(appointment.date).isAfter(now)
    );

    return (
      <View style={styles.headerCard}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Appointments</Text>
          <Text style={styles.headerSubtitle}>{moment().format('DD MMM, YYYY')}</Text>
        </View>
        <View style={styles.body}>
          {upcomingAppointment ? (
            <>
              <Image source={{ uri: 'https://bootdey.com/img/Content/avatar/avatar6.png' }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{upcomingAppointment.patientName}</Text>
                <Text style={styles.userRole}>{moment(upcomingAppointment.date).format('DD MMM, HH:mm')}</Text>
                <Text style={styles.cardStatus}>{upcomingAppointment.status}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noAppointments}>No upcoming appointments</Text>
          )}
        </View>
      </View>
    );
  };

  const renderTaskItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.taskItem}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        {index < tasks.length - 1 && <View style={styles.line} />}
      </View>
      <Text style={styles.taskText}>{item}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {user.isLoggedIn ? (
        <>
          <View style={styles.card}>
            <Text style={styles.greetingText}>Welcome, {user.name}!</Text>
            
          </View>

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
                onPress={() => router.push('/tasks')} // Update navigation to use router
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
                onPress={() => router.push('/consultations')} // Navigate to Patients screen
              >
                <Icon name="users" size={24} color="#2196F3" style={styles.icon} />
                <Text style={styles.overviewLabel}>Patients</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.analyticsContainer}>
            <Text style={styles.chartTitle}>Appointments Overview</Text>
            <BarChart
              data={{
                labels: ['Total', 'Upcoming', 'Requested', 'Completed'],
                datasets: [
                  {
                    data: [
                      totalAppointments,
                      upcomingAppointments.length,
                      requestedAppointments.length,
                      completedAppointments.length,
                    ],
                  },
                ],
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
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

          {/* Tasks Section */}
          <View style={styles.tasksContainer}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>Your Tasks</Text>
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

          {/* Add Task Modal */}
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
                <Button
                  title="Add Task"
                  onPress={() => {
                    if (newTask.trim()) {
                      addTask(newTask.trim());
                      setNewTask('');
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

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => rgba(0, 0, 0, opacity),
  labelColor: (opacity = 1) => rgba(0, 0, 0, opacity),
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#c5f0a4', // Match the background color of ScheduleScreen
  },
  card: {
    backgroundColor: '#ff7f50',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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
  overviewNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  analyticsContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  customLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#7F7F7F',
  },
  upcomingContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
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
  loginPrompt: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
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
  headerCard: {
    backgroundColor: '#f7f39a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#333',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    color: '#333',
  },
  cardStatus: {
    fontSize: 12,
    color: '#333',
  },
  noAppointments: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
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
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
});

export default DashboardScreen;
const rgba = (r: number, g: number, b: number, a: number) => {
  return `rgba(${r},${b},${g},${a})`;
};

