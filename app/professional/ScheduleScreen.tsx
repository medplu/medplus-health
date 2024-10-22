import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Modal, Button } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { Card, Avatar, TextInput, Checkbox } from 'react-native-paper';
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

const Schedule: React.FC = () => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ time: '', slots: 1, duration: 30 });
  const [timeRange, setTimeRange] = useState({ start: '08:00', duration: 30 });
  const [repeatForWeek, setRepeatForWeek] = useState(false);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const scheduleResponse = await fetch(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      const scheduleData = await scheduleResponse.json();

      const newItems: AgendaSchedule = {};

      // Process schedule data
      scheduleData.slots.forEach((slot: any) => {
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

      return newItems;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return {};
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const professionalId = await AsyncStorage.getItem('doctorId');
        if (!professionalId) {
          throw new Error('Professional ID not found in AsyncStorage');
        }

        // Fetch appointments for the professional
        const appointmentsResponse = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${professionalId}`);
        const appointmentsData = await appointmentsResponse.json();

        // Fetch schedule for the professional
        const scheduleItems = await fetchSchedule(professionalId);

        const newItems: AgendaSchedule = { ...scheduleItems };

        // Process appointments data
        appointmentsData.forEach((appointment: any) => {
          const strTime = moment(appointment.date).format('YYYY-MM-DD');
          if (!newItems[strTime]) {
            newItems[strTime] = [];
          }
          newItems[strTime].push({
            name: `Appointment with ${appointment.patientName}`,
            type: 'appointment',
            height: 120,
            time: appointment.time,
            patientImage: appointment.patientImage || 'https://via.placeholder.com/40',
          });
        });

        setItems(newItems);
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

      // If the repeat for the week option is selected, apply the schedule to all weekdays
      const dates = repeatForWeek ? getWeekDates(selectedDate) : [selectedDate];
      const availabilityForWeek = dates.flatMap((date) => timeSlots.map((time) => ({
        date, // Include the specific date
        time,
      })));

      const response = await fetch(`https://medplus-health.onrender.com/api/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ professionalId, availability: availabilityForWeek }),
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
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const getWeekDates = (selectedDate: string) => {
    const startOfWeek = moment(selectedDate).startOf('isoWeek');
    return Array.from({ length: 5 }, (_, i) => startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD'));
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
    <View style={{ flex: 1 }}>
      <Agenda
        items={items}
        loadItemsForMonth={() => {}}
        selected={new Date().toISOString().split('T')[0]}
        renderItem={renderItem}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          backgroundColor: '#6200ee',
          borderRadius: 50,
          width: 60,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: '#fff', fontSize: 30 }}>+</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Set Availability</Text>
            <TextInput
              label="Start Time"
              value={timeRange.start}
              onChangeText={(text) => setTimeRange((prev) => ({ ...prev, start: text }))}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Duration (minutes)"
              value={eventDetails.duration.toString()}
              onChangeText={(text) => setEventDetails((prev) => ({ ...prev, duration: Number(text) }))}
              keyboardType="numeric"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Number of Slots"
              value={eventDetails.slots.toString()}
              onChangeText={(text) => setEventDetails((prev) => ({ ...prev, slots: Number(text) }))}
              keyboardType="numeric"
              style={{ marginBottom: 12 }}
            />
            <Checkbox
              status={repeatForWeek ? 'checked' : 'unchecked'}
              onPress={() => setRepeatForWeek(!repeatForWeek)}
            />
            <Text>Repeat this pattern for the week</Text>
            <Button title="Add Availability" onPress={handleAddAvailability} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Schedule;