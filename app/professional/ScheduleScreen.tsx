import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments'; // Import useAppointments
import { selectUser } from '../store/userSlice';
import Colors from '../../components/Shared/Colors';
import axios from 'axios'; // Import axios for making API calls

// Define interfaces
interface Patient {
  name: string;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  date: string;
  time: string;
  status: string;
  slotId: string; // Add slotId to associate appointment with a slot
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: boolean;
  isBooked: boolean;
  patientId?: Patient;
  date: string;
  appointment?: Appointment; // Add optional appointment property
}

interface User {
  name: string;
  professional?: {
    _id: string;
  };
}

const ScheduleScreen: React.FC = () => {
  const user: User = useSelector(selectUser);
  const { schedule, fetchSchedule } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments(); // Fetch appointments
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ [key: string]: Slot[] }>({});
  const [todayAppointments, setTodayAppointments] = useState<Slot[]>([]);

  // Log user data when the component mounts
  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  const fetchProfessionalId = async () => {
    try {
      const professionalId = user?.professional?._id;
      if (!professionalId) throw new Error('Professional ID not found');
      
      console.log('Professional ID:', professionalId);
      fetchSchedule(professionalId);
    } catch (error) {
      console.error('Error fetching professional ID:', error);
    }
  };

  useEffect(() => {
    fetchProfessionalId();
  }, [user]);

  useEffect(() => {
    // Log appointments data to inspect structure
    console.log('Appointments Data:', appointments);

    const transformSchedule = () => {
      // Log the schedule data before transforming
      console.log('Schedule data before transform:', schedule);

      const newItems: { [key: string]: Slot[] } = {};
      const todayAppointmentsList: Slot[] = [];

      // Create a map of timeSlotId to appointment for quick lookup
      const appointmentMap: { [key: string]: Appointment } = {};
      appointments.forEach((appointment) => {
        if (appointment.timeSlotId) { // Use timeSlotId instead of slotId
          appointmentMap[appointment.timeSlotId] = appointment;
        }
      });

      // Ensure schedule is an array
      if (Array.isArray(schedule)) {
        schedule.forEach((slot) => {
          const strDate = moment(slot.date).format('YYYY-MM-DD');
          if (!newItems[strDate]) {
            newItems[strDate] = [];
          }

          const { _id: slotId, startTime, endTime, isBooked, patientId, date } = slot;

          // Find associated appointment using timeSlotId
          const associatedAppointment = appointmentMap[slotId];

          const slotInfo: Slot = {
            ...slot,
            name: isBooked
              ? associatedAppointment
                ? `Appointment with ${associatedAppointment.patientId.name}`
                : 'Booked Slot'
              : 'Available Slot',
            type: isBooked ? 'appointment' : 'availability',
            appointment: associatedAppointment, // Attach appointment data if exists
          };

          newItems[strDate].push(slotInfo);

          if (strDate === moment().format('YYYY-MM-DD') && isBooked) {
            todayAppointmentsList.push(slotInfo);
          }
        });
      } else {
        console.warn('Schedule is not an array:', schedule);
      }

      console.log('Transformed Schedule:', newItems);
      console.log('Today\'s Appointments:', todayAppointmentsList);

      setItems(newItems);
      setTodayAppointments(todayAppointmentsList);
      setLoading(false);
    };

    if (!appointmentsLoading && !appointmentsError) { // Ensure appointments data is loaded
      transformSchedule();
    }
  }, [schedule, appointments, appointmentsLoading, appointmentsError]);

  const resetElapsedSlots = async () => {
    try {
      const professionalId = user?.professional?._id;
      if (!professionalId) throw new Error('Professional ID not found');

      await axios.post(`/api/schedule/resetElapsedSlots/${professionalId}`);
      fetchSchedule(professionalId); // Refresh the schedule after resetting slots
    } catch (error) {
      console.error('Error resetting elapsed slots:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(resetElapsedSlots, 60000); // Check every minute
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [user]);

  const renderClassItem = ({ item }: { item: Slot }) => (
    <View style={styles.classItem}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>

      <View style={styles.classContent}>
        <View style={styles.classHours}>
          <Text style={styles.startTime}>{item.startTime}</Text>
          <Text style={styles.endTime}>{item.endTime}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: item.type === 'appointment' ? '#f7f39a' : '#a3de83' }]}>
          {item.type === 'appointment' ? (
            item.appointment ? (
              <>
                <Text style={styles.cardTitle}>{item.appointment.patientId.name}</Text>
                <Text style={styles.cardDate}>{moment(item.appointment.date).format('DD MMM, HH:mm')}</Text>
                <Text style={styles.cardStatus}>{item.appointment.status}</Text>
              </>
            ) : (
              <Text style={styles.cardTitle}>Booked Slot</Text>
            )
          ) : (
            <>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDate}>{moment(item.date).format('DD MMM, HH:mm')}</Text>
            </>
          )}
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    const now = moment();
    const upcomingAppointment = todayAppointments.find(
      (appointment) => appointment.appointment?.status === 'confirmed' && moment(appointment.appointment?.date).isAfter(now)
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
                <Text style={styles.userName}>{upcomingAppointment.appointment?.patientId.name}</Text>
                <Text style={styles.userRole}>{moment(upcomingAppointment.appointment?.date).format('DD MMM, HH:mm')}</Text>
                <Text style={styles.cardStatus}>{upcomingAppointment.appointment?.status}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.noAppointments}>No upcoming appointments</Text>
          )}
        </View>
      </View>
    );
  };
  

  const dateOptions = Array.from({ length: 7 }).map((_, i) => moment().add(i, 'days').toDate());

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Schedule</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
      ) : (
        <>
          <FlatList
            horizontal
            data={dateOptions}
            keyExtractor={(item) => item.toISOString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedDate(item)}
                style={[
                  styles.dateButton,
                  selectedDate.toDateString() === item.toDateString() ? styles.selectedDateButton : null,
                ]}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate.toDateString() === item.toDateString() ? styles.selectedDateText : null,
                  ]}
                >
                  {moment(item).format('ddd, DD')}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
          <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>
          <FlatList
            contentContainerStyle={styles.contentContainer}
            data={items[moment(selectedDate).format('YYYY-MM-DD')] || []}
            ListHeaderComponent={renderHeader}
            renderItem={renderClassItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      )}
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f7f39a', // e.g., '#FFFFFF' for white
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#a3de83',
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
  headerTitle: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
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
    color: Colors.primary,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
  },
  dateButton: {
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2, // Add border width
    borderColor: 'transparent', // Default border color
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateButton: {
    borderColor: Colors.primary, 
  },
  dateText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  selectedDateText: {
    borderColor: Colors.primary, 
  },
  dateTitle: {
    fontSize: 18,
    color: Colors.primary,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  classItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#346473',
  },
  timelineLine: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.primary,
  },
  classContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#f7f39a',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  endTime: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardDate: {
    fontSize: 14,
    color: Colors.primary,
  },
  cardStatus: { // New style for appointment status
    fontSize: 12,
    color: Colors.secondaryText,
  },
  loading: {
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  noAppointments: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ScheduleScreen;
