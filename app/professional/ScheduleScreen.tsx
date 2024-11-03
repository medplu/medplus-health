import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { Card, TextInput, Button, Modal, Portal, Provider, RadioButton } from 'react-native-paper';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import { selectUser } from '../store/userSlice'; 
import { useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

// Update the function to generate time slots with start and end times
const generateTimeSlots = (startTime, duration, slots) => {
  const timeSlots = [];
  let [hours, minutes] = startTime.split(':').map(Number);

  for (let i = 0; i < slots; i++) {
    const start = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const endMinutes = minutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const end = `${String(hours + endHours).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
    
    timeSlots.push({ startTime: start, endTime: end, status: 'available' });

    // Increment the start time for the next slot
    minutes += duration;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
  }

  return timeSlots;
};

const getDates = (startDate, pattern, duration) => {
  const dates = [];
  const start = moment(startDate);

  for (let i = 0; i < duration; i++) {
    dates.push(start.format('YYYY-MM-DD'));

    switch (pattern) {
      case 'daily':
        start.add(1, 'days');
        break;
      case 'weekly':
        start.add(1, 'weeks');
        break;
      case 'monthly':
        start.add(1, 'months');
        break;
      default:
        break;
    }
  }

  return dates;
};

// Add this function at the top level
async function schedulePushNotification(title, body, trigger) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger,
  });
}

// Add notification permission setup
async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

const Schedule = () => {
  const user = useSelector(selectUser);
  const { schedule, fetchSchedule } = useSchedule();
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ slots: 1, duration: 30 });
  const [timeRange, setTimeRange] = useState({ start: '08:00', duration: 30 });
  const [repeatPattern, setRepeatPattern] = useState('daily');
  const [repeatDuration, setRepeatDuration] = useState(1);
  const [step, setStep] = useState(1);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchProfessionalId = async () => {
    try {
      const professionalId = user?.professional?._id; 
      if (!professionalId) throw new Error('Professional ID not found');

      fetchSchedule(professionalId);
    } catch (error) {
      console.error('Error fetching professional ID:', error);
    }
  };

  useEffect(() => {
    fetchProfessionalId();
  }, [user]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const transformSchedule = () => {
      const newItems = {};
      const todayAppointments = [];

      schedule.forEach((slot) => {
        const strTime = moment(slot.date).format('YYYY-MM-DD');
        if (!newItems[strTime]) {
          newItems[strTime] = [];
        }

        const { startTime, endTime, status, patientId } = slot;
        const slotInfo = {
          name: status === 'booked' ? `Appointment with ${patientId?.name || 'Patient'}` : 'Available Slot',
          type: status === 'booked' ? 'appointment' : 'availability',
          height: 80,
          startTime,
          endTime,
          patientId,
        };

        newItems[strTime].push(slotInfo);

        // Schedule notification for booked appointments
        if (status === 'booked') {
          const appointmentDate = moment(`${strTime} ${startTime}`, 'YYYY-MM-DD HH:mm');
          const notificationDate = appointmentDate.subtract(30, 'minutes').toDate();
          
          schedulePushNotification(
            'Upcoming Appointment',
            `You have an appointment with ${patientId?.name || 'Patient'} at ${startTime}`,
            { date: notificationDate }
          );
        }

        if (strTime === moment().format('YYYY-MM-DD') && status === 'booked') {
          todayAppointments.push(slotInfo);
        }
      });

      setItems(newItems);
      setTodayAppointments(todayAppointments);
      setLoading(false);
    };

    transformSchedule();
  }, [schedule]);

  const handleAddAvailability = async () => {
    try {
      const professionalId = user?.professional?._id; 
      if (!professionalId) {
        throw new Error('Professional ID not found');
      }

      const timeSlots = generateTimeSlots(timeRange.start, eventDetails.duration, eventDetails.slots);
      const dates = getDates(selectedDate, repeatPattern, repeatDuration);
      const availability = dates.flatMap((date) => 
        timeSlots.map(({ startTime, endTime }) => ({
          date,
          startTime,
          endTime,
          status: 'available', // Set status as available by default
        }))
      );

      const response = await fetch(`https://medplus-health.onrender.com/api/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professionalId, availability }),
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      const newItems = { ...items };
      dates.forEach((date) => {
        if (!newItems[date]) {
          newItems[date] = [];
        }
        timeSlots.forEach(({ startTime, endTime }) => {
          newItems[date].push({
            name: 'Available Slot',
            height: 80,
            type: 'availability',
            startTime,
            endTime,
          });
        });
      });

      setItems(newItems);
      setModalVisible(false);
      setEventDetails({ slots: 1, duration: 30 });
      setStep(1);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.modalTitle}>Set Availability</Text>
            <Button mode="contained" onPress={() => setStep(2)} style={styles.button}>
              Start
            </Button>
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.modalTitle}>Choose Start Time</Text>
            <TextInput
              label="Start Time"
              value={timeRange.start}
              onChangeText={(text) => setTimeRange((prev) => ({ ...prev, start: text }))}
              style={styles.input}
            />
            <Button mode="contained" onPress={() => setStep(3)} style={styles.button}>
              Next
            </Button>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.modalTitle}>Specify Duration for Each Patient</Text>
            <TextInput
              label="Duration (minutes)"
              value={eventDetails.duration.toString()}
              onChangeText={(text) => setEventDetails((prev) => ({ ...prev, duration: Number(text) }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={() => setStep(4)} style={styles.button}>
              Next
            </Button>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.modalTitle}>Specify Number of Patients</Text>
            <TextInput
              label="Number of Slots"
              value={eventDetails.slots.toString()}
              onChangeText={(text) => setEventDetails((prev) => ({ ...prev, slots: Number(text) }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={() => setStep(5)} style={styles.button}>
              Next
            </Button>
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.modalTitle}>Choose Repeat Pattern and Duration</Text>
            <RadioButton.Group onValueChange={value => setRepeatPattern(value)} value={repeatPattern}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="daily" />
                <Text>Daily</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="weekly" />
                <Text>Weekly</Text>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="monthly" />
                <Text>Monthly</Text>
              </View>
            </RadioButton.Group>
            <TextInput
              label="Duration (times)"
              value={repeatDuration.toString()}
              onChangeText={(text) => setRepeatDuration(Number(text))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddAvailability} style={styles.button}>
              Submit
            </Button>
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = (item) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemTime}>{item.startTime} - {item.endTime}</Text>
        {item.type === 'appointment' && (
          <Button 
            mode="contained" 
            onPress={() => handleReminder(item)}
            style={styles.reminderButton}
          >
            Set Reminder
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  // Add handleReminder function
  const handleReminder = async (appointment) => {
    try {
      const { date, startTime } = appointment;
      const appointmentDate = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
      const notificationDate = appointmentDate.subtract(30, 'minutes').toDate();

      await schedulePushNotification(
        'Upcoming Appointment',
        `You have an appointment at ${startTime}`,
        { date: notificationDate }
      );

      alert('Reminder set successfully!');
    } catch (error) {
      console.error('Error setting reminder:', error);
      alert('Failed to set reminder');
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Agenda
            items={items}
            renderItem={renderItem}
            renderEmptyData={() => <View><Text>No Availability</Text></View>}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setModalVisible(true);
            }}
          />
        )}
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          {renderStepContent()}
        </Modal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: { margin: 5 },
  modalContainer: { padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 20 },
  input: { marginBottom: 10 },
  button: { marginTop: 10 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center' },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  reminderButton: {
    marginTop: 5,
  },
});

export default Schedule;
