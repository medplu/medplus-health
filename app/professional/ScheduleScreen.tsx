import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
      />
    </View>
  );
};

export default Schedule;
