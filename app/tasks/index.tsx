import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Task {
  id: string;
  description: string;
  time: string;
}

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { schedule, fetchSchedule, loading, error } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>('');

  useEffect(() => {
    console.log('Appointments Data:', appointments);
    
    const currentTime = moment();
    
    const filteredAppointments = appointments.filter(app => 
      app.status === 'booked' && moment(`${app.date} ${app.time}`, 'YYYY-MM-DD HH:mm').isAfter(currentTime)
    );
    
    const transformedTasks = filteredAppointments.map(app => ({
      id: app._id,
      description: `Meet with ${app.patientId.name}`,
      time: app.time,
    }));
    
    console.log('Transformed Tasks:', transformedTasks);
    setTasks(transformedTasks);
  }, [appointments]);

  const addTask = () => {
    if (newTask.trim()) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        description: newTask.trim(),
        time: moment().format('HH:mm'),
      };
      console.log('Adding Task:', newTaskObj);
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
    }
  };

  useEffect(() => {
    console.log('Current Tasks:', tasks);
  }, [tasks]);

  const renderTaskItem = ({ item, index }: { item: Task; index: number }) => (
    <View style={styles.taskItem}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        {index < tasks.length - 1 && <View style={styles.line} />}
      </View>
      <View style={styles.taskContent}>
        <Text style={styles.taskTime}>{item.time}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
    </View>
  );

  if (loading || appointmentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || appointmentsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || appointmentsError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Your Tasks</Text>
      {tasks.length > 0 ? (
        <FlatList
          data={tasks}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text style={styles.noTasksText}>No upcoming tasks.</Text>
      )}
      <View style={styles.addTaskContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#c5f0a4',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  taskContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 16,
    color: '#333',
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
  noTasksText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  addTaskContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
});

export default TaskScreen;