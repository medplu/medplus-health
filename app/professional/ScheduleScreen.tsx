import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { Card, Avatar, TextInput, Checkbox, Button, Modal, Portal, Provider, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const generateTimeSlots = (start: string, duration: number, slots: number) => {
  const startTime = moment(start, 'HH:mm');
  const timeSlots = [];

  for (let i = 0; i < slots; i++) {
    const endSlot = moment(startTime).add(duration, 'minutes');
    timeSlots.push(`${startTime.format('HH:mm')} - ${endSlot.format('HH:mm')}`);
    startTime.add(duration, 'minutes');
  }

  return timeSlots;
};

const getDates = (selectedDate: string, repeatPattern: string, repeatDuration: number) => {
  const dates = [];
  const startDate = moment(selectedDate);

  for (let i = 0; i < repeatDuration; i++) {
    if (repeatPattern === 'daily') {
      dates.push(startDate.clone().add(i, 'days').format('YYYY-MM-DD'));
    } else if (repeatPattern === 'weekly') {
      dates.push(startDate.clone().add(i * 7, 'days').format('YYYY-MM-DD'));
    } else if (repeatPattern === 'monthly') {
      dates.push(startDate.clone().add(i, 'months').format('YYYY-MM-DD'));
    }
  }

  return dates;
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ time: '', slots: 1, duration: 30 });
  const [timeRange, setTimeRange] = useState({ start: '08:00', duration: 30 });
  const [repeatPattern, setRepeatPattern] = useState('daily');
  const [repeatDuration, setRepeatDuration] = useState(1);
  const [step, setStep] = useState(1);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      const data = await response.json();

      const newItems: AgendaSchedule = {};

      // Transform fetched data into the expected format
      data.slots.forEach((slot: any) => {
        const strTime = moment(slot.date).format('YYYY-MM-DD');
        if (!newItems[strTime]) {
          newItems[strTime] = [];
        }
        newItems[strTime].push({
          name: 'Available Slot',
          type: 'availability',
          height: 80,
          time: slot.time,
        });
      });

      setItems(newItems);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const professionalId = await AsyncStorage.getItem('doctorId');
        if (professionalId) {
          await fetchSchedule(professionalId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAvailability = async () => {
    try {
      const professionalId = await AsyncStorage.getItem('doctorId');
      if (!professionalId) {
        throw new Error('Professional ID not found in AsyncStorage');
      }

      // Generate time slots based on input
      const timeSlots = generateTimeSlots(timeRange.start, eventDetails.duration, eventDetails.slots);

      // Generate dates based on repeat pattern and duration
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
      setStep(1); // Reset step to 1
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

  const renderItem = useCallback(
    (item: AgendaEntry) => (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card style={{ backgroundColor: item.type === 'appointment' ? '#f8d7da' : '#d4edda' }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>{item.name}</Text>
              {item.type === 'appointment' && (
                <Avatar.Image source={{ uri: item.patientImage || 'https://via.placeholder.com/40' }} size={40} />
              )}
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
});

export default Schedule;