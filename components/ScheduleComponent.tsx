import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import moment from 'moment';
import axios from 'axios';

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
  _id: string;
}

interface Schedule {
  _id: string;
  doctorId: string;
  __v: number;
  createdAt: string;
  slots: Slot[];
}

const ScheduleComponent: React.FC<{ doctorId: string, onTimeSlotSelect: (slot: { id: string; time: string }) => void }> = ({ doctorId, onTimeSlotSelect }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(moment());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ id: string; time: string } | null>(null);
  const [next7Days, setNext7Days] = useState<{ date: moment.Moment; formattedDate: string }[]>([]);

  useEffect(() => {
    fetchSchedule(doctorId);
    getDays();
  }, [doctorId]);

  const fetchSchedule = async (doctorId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${doctorId}`);
      if (response.data.status === 'Success' && response.data.data) {
        setSchedule(response.data.data);
        console.log('Fetched schedule:', response.data.data);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const getDays = () => {
    const nextSevenDays = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      nextSevenDays.push({
        date: date,
        formattedDate: date.format('Do MMM'),
      });
    }
    setNext7Days(nextSevenDays);
  };

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset selected time slot when date changes
  };

  const handleTimeSlotSelect = (slot: { id: string; time: string }) => {
    setSelectedTimeSlot(slot);
    onTimeSlotSelect(slot);
  };

  const screenWidth = Dimensions.get('window').width;

  // Ensure schedule exists before trying to filter
  const filteredTimeSlots = schedule && schedule.slots
    ? schedule.slots.filter(slot => moment(slot.date).isSame(selectedDate, 'day'))
    : [];

  return (
    <View>
      <Text style={styles.sectionTitle}>Pick a Day</Text>
      <FlatList
        data={next7Days}
        numColumns={7}
        keyExtractor={(item) => item.date.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleDateSelect(item.date)}
            style={[styles.dateButton, selectedDate?.isSame(item.date, 'day') ? { backgroundColor: '#1f6f78' } : null, { width: screenWidth / 7 - 10 }]}
          >
            <Text style={styles.dayInitial}>{item.date.format('ddd').toUpperCase()}</Text>
            <Text style={styles.dateText}>{item.date.format('D')}</Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>Pick a Time</Text>
      {filteredTimeSlots.length > 0 ? (
        <FlatList
          horizontal
          data={filteredTimeSlots}
          keyExtractor={(item) => item._id} // Use _id as the unique key
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleTimeSlotSelect({ id: item._id, time: item.time })} // Set both id and time
              style={[styles.timeSlotButton, selectedTimeSlot?.id === item._id ? { backgroundColor: '#1f6f78' } : null]}
            >
              <Text style={styles.timeSlotText}>{item.time}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 15 }}
        />
      ) : (
        <Text style={styles.noScheduleText}>
          No available time slots for the selected doctor. Please try another date or doctor.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  dayInitial: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
  },
  timeSlotButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  timeSlotText: {
    fontSize: 14,
  },
  noScheduleText: {
    fontSize: 14,
    color: '#ff0000',
    marginTop: 10,
  },
});

export default ScheduleComponent;