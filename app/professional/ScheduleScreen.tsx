import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Modal, TextInput, Button } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { Card, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ time: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctorId');
        if (!doctorId) {
          throw new Error('Doctor ID not found in AsyncStorage');
        }

        // Fetch appointments for the doctor
        const appointmentsResponse = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${doctorId}`);
        const appointmentsData = await appointmentsResponse.json();

        const newItems: AgendaSchedule = {};

        // Process appointments data
        appointmentsData.forEach((appointment: any) => {
          const strTime = moment(appointment.date).format('YYYY-MM-DD');  // Correct date format
          if (!newItems[strTime]) {
            newItems[strTime] = [];
          }
          newItems[strTime].push({
            name: `Appointment with ${appointment.patientName}`,
            type: 'appointment',
            height: 120,
            time: appointment.time,  // Appointment time
            patientImage: appointment.patientImage || 'https://via.placeholder.com/40',
          });
        });

        setItems(newItems);  // Update items in agenda
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAvailability = async () => {
    try {
      const doctorId = await AsyncStorage.getItem('doctorId');
      if (!doctorId) {
        throw new Error('Doctor ID not found in AsyncStorage');
      }

      const availabilityDetails = {
        date: selectedDate,
        time: eventDetails.time,
        doctorId: doctorId,
      };

      const response = await fetch('https://medplus-health.onrender.com/api/professionals/update-availability/' + doctorId, {
        method: 'PUT',  // Change to PUT for updating availability
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availabilityDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to create availability');
      }

      const newItems = { ...items };
      if (!newItems[selectedDate]) {
        newItems[selectedDate] = [];
      }
      newItems[selectedDate].push({
        name: 'Available Slot',
        height: 100,
        type: 'availability',
        time: eventDetails.time,
      });

      setItems(newItems);
      setModalVisible(false);
      setEventDetails({ time: '' });
    } catch (error) {
      console.error('Error creating availability:', error);
    }
  };

  const renderItem = useCallback(
    (item: AgendaEntry) => (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card style={{ backgroundColor: item.type === 'appointment' ? '#f8d7da' : '#d4edda' }}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
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
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Add Availability</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 }}
              placeholder="Availability Time"
              value={eventDetails.time}
              onChangeText={(text) => setEventDetails({ time: text })}
            />
            <Button title="Add Availability" onPress={handleAddAvailability} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Schedule;
