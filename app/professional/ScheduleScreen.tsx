import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { Card, Avatar, TextInput, Button, Modal, Portal, Provider, RadioButton } from 'react-native-paper';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import { selectUser } from '../store/userSlice'; // Import your selector for user
import { useSelector } from 'react-redux';

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const generateTimeSlots = (startTime: string, duration: number, slots: number): string[] => {
  const timeSlots: string[] = [];
  let [hours, minutes] = startTime.split(':').map(Number);

  for (let i = 0; i < slots; i++) {
    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    timeSlots.push(time);

    minutes += duration;
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
  }

  return timeSlots;
};

const getDates = (startDate: string, pattern: string, duration: number): string[] => {
  const dates: string[] = [];
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

const Schedule: React.FC = () => {
  const user = useSelector(selectUser); // Use the same selector to access the user

  const { schedule, fetchSchedule } = useSchedule();
  const [items, setItems] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ time: '', slots: 1, duration: 30 });
  const [timeRange, setTimeRange] = useState({ start: '08:00', duration: 30 });
  const [repeatPattern, setRepeatPattern] = useState('daily');
  const [repeatDuration, setRepeatDuration] = useState(1);
  const [step, setStep] = useState(1);
  const [todayAppointments, setTodayAppointments] = useState<AgendaEntry[]>([]);

  const fetchProfessionalId = async () => {
    try {
      const professionalId = user?.professional?._id; // Safely access professionalId
      if (!professionalId) throw new Error('Professional ID not found');

      fetchSchedule(professionalId);
    } catch (error) {
      console.error('Error fetching professional ID from Redux:', error);
    }
  };

  useEffect(() => {
    fetchProfessionalId();
  }, [user]);

  useEffect(() => {
    const transformSchedule = () => {
      const newItems: AgendaSchedule = {};
      const todayAppointments: AgendaEntry[] = [];

      schedule.forEach((slot: Slot) => {
        const strTime = moment(slot.date).format('YYYY-MM-DD');
        if (!newItems[strTime]) {
          newItems[strTime] = [];
        }
        if (slot.isBooked) {
          newItems[strTime].push({
            name: 'Booked Slot',
            type: 'appointment',
            height: 80,
            time: slot.time,
          });

          if (strTime === moment().format('YYYY-MM-DD')) {
            todayAppointments.push({
              name: 'Booked Slot',
              type: 'appointment',
              height: 80,
              time: slot.time,
            });
          }
        } else {
          newItems[strTime].push({
            name: 'Available Slot',
            type: 'availability',
            height: 80,
            time: slot.time,
          });
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
      const professionalId = user?.professional?._id; // Safely access professionalId
      if (!professionalId) {
        throw new Error('Professional ID not found');
      }

      const timeSlots = generateTimeSlots(timeRange.start, eventDetails.duration, eventDetails.slots);
      const dates = getDates(selectedDate, repeatPattern, repeatDuration);
      const availability = dates.flatMap((date) => timeSlots.map((time) => ({
        date,
        time,
      })));

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
        timeSlots.forEach((time) => {
          newItems[date].push({
            name: 'Available Slot',
            height: 80,
            type: 'availability',
            time,
          });
        });
      });

      setItems(newItems);
      setModalVisible(false);
      setEventDetails({ time: '', slots: 1, duration: 30 });
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
              label="Repeat Duration"
              value={repeatDuration.toString()}
              onChangeText={(text) => setRepeatDuration(Number(text))} 
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddAvailability} style={styles.button}>
              Finish
            </Button>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTodayAppointments = () => {
    return (
      <View style={styles.todayAppointmentsContainer}>
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        {todayAppointments.map((appointment, index) => (
          <Card key={index} style={styles.appointmentCard}>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>{appointment.name}</Text>
                <Avatar.Image source={{ uri: 'https://via.placeholder.com/40' }} size={40} />
              </View>
              <Text>{appointment.time}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderItem = useCallback(
    (item: AgendaEntry) => (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card style={{ backgroundColor: item.type === 'appointment' ? '#f8d7da' : '#d4edda' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{item.name}</Text>
            </View>
            <Text>{item.time}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    ),
    []
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        {renderTodayAppointments()}
        <Agenda
          items={items}
          loadItemsForMonth={() => {}}
          selected={new Date().toISOString().split('T')[0]}
          renderItem={renderItem}
          onDayPress={(day) => setSelectedDate(day.dateString)}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            {renderStepContent()}
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6200ee',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 30,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
  },
  todayAppointmentsContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appointmentCard: {
    marginBottom: 10,
  },
});

export default Schedule;