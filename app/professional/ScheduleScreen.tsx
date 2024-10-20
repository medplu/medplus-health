import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Modal, TextInput, Button } from 'react-native';
import { Agenda, AgendaEntry, AgendaSchedule } from 'react-native-calendars';
import { Card, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'; // To handle date formatting

const timeToString = (time: number): string => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState<AgendaSchedule>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(timeToString(Date.now()));
  const [eventDetails, setEventDetails] = useState({ name: '', time: '', patientImage: '' });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctorId');
        if (!doctorId) {
          throw new Error('Doctor ID not found in AsyncStorage');
        }

        const response = await fetch(`https://medplus-app.onrender.com/api/appointments/doctor/${doctorId}`);
        const data = await response.json();

        const newItems: AgendaSchedule = {};

        // Populate the agenda items with the fetched appointments
        data.forEach((appointment: any) => {
          const strTime = moment(appointment.date).format('YYYY-MM-DD');
          if (!newItems[strTime]) {
            newItems[strTime] = [];
          }
          newItems[strTime].push({
            name: appointment.patientName,
            height: 100, // Adjust the height if necessary
            patientImage: appointment.patientImage,
            time: appointment.time,
          });
        });

        setItems(newItems);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleAddEvent = () => {
    const newItems = { ...items };
    if (!newItems[selectedDate]) {
      newItems[selectedDate] = [];
    }
    newItems[selectedDate].push({
      name: eventDetails.name,
      height: 100,
      patientImage: eventDetails.patientImage,
      time: eventDetails.time,
    });
    setItems(newItems);
    setModalVisible(false);
    setEventDetails({ name: '', time: '', patientImage: '' });
  };

  const renderItem = (item: AgendaEntry) => {
    return (
      <TouchableOpacity style={{ marginRight: 10, marginTop: 17 }}>
        <Card>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text>{item.name}</Text>
              <Avatar.Image source={{ uri: item.patientImage || 'https://via.placeholder.com/40' }} size={40} />
            </View>
            <Text>{item.time}</Text> {/* Show appointment time */}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

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
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Add Event</Text>
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 }}
              placeholder="Event Name"
              value={eventDetails.name}
              onChangeText={(text) => setEventDetails({ ...eventDetails, name: text })}
            />
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 }}
              placeholder="Event Time"
              value={eventDetails.time}
              onChangeText={(text) => setEventDetails({ ...eventDetails, time: text })}
            />
            <TextInput
              style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 }}
              placeholder="Patient Image URL"
              value={eventDetails.patientImage}
              onChangeText={(text) => setEventDetails({ ...eventDetails, patientImage: text })}
            />
            <Button title="Add Event" onPress={handleAddEvent} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Schedule;