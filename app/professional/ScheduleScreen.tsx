import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments'; 
import { selectUser } from '../store/userSlice';
import Colors from '../../components/Shared/Colors';
import axios from 'axios'; 


interface Patient {
  name: string;
}

interface Appointment {
  _id: string;
  patientId: Patient;
  date: string;
  time: string;
  status: string;
  slotId: string;
}

interface Slot {
  _id: string;
  startTime: string;
  endTime: boolean;
  isBooked: boolean;
  patientId?: Patient;
  date: string;
  appointment?: Appointment; 
  color?: string; 
}

interface User {
  name: string;
  professional?: {
    _id: string;
  };
}


const bookedSlotColors = ['#e6c39a', '#d4a76c', '#c39156']; 

const ScheduleScreen: React.FC = () => {
  const user: User = useSelector(selectUser);
  const { schedule, fetchSchedule } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ [key: string]: Slot[] }>({});
  const [todayAppointments, setTodayAppointments] = useState<Slot[]>([]);
  const [scheduleFetched, setScheduleFetched] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfessionalId = async () => {
      try {
        const professionalId = user?.professional?._id;
        if (!professionalId) throw new Error('Professional ID not found');
        await fetchSchedule(professionalId);
        setScheduleFetched(true);
      } catch (error) {
        console.error('Error fetching professional ID:', error);
      }
    };

    if (user?.professional?._id && !scheduleFetched) {
      fetchProfessionalId();
    }
  }, [user, scheduleFetched]);

  useEffect(() => {
    const transformSchedule = () => {
      const newItems: { [key: string]: Slot[] } = {};
      const todayAppointmentsList: Slot[] = [];

      const appointmentMap: { [key: string]: Appointment } = {};
      appointments.forEach((appointment) => {
        if (appointment.timeSlotId) { 
          appointmentMap[appointment.timeSlotId] = appointment;
        }
      });

      if (Array.isArray(schedule)) {
        schedule.forEach((slot) => {
          const strDate = moment(slot.date).format('YYYY-MM-DD');
          if (!newItems[strDate]) {
            newItems[strDate] = [];
          }

          const { _id: slotId, startTime, endTime, isBooked, patientId, date } = slot;
          const associatedAppointment = appointmentMap[slotId];

          const slotInfo: Slot = {
            ...slot,
            name: isBooked
              ? associatedAppointment
                ? `Appointment with ${associatedAppointment.patientId.name}`
                : 'Booked Slot'
              : 'Available Slot',
            type: isBooked ? 'appointment' : 'availability',
            appointment: associatedAppointment, 
            color: isBooked
              ? bookedSlotColors[todayAppointmentsList.length % bookedSlotColors.length]
              : '#a3de83',
          };

          newItems[strDate].push(slotInfo);

          if (strDate === moment().format('YYYY-MM-DD') && isBooked) {
            todayAppointmentsList.push(slotInfo);
          }
        });
      } else {
        console.warn('Schedule is not an array:', schedule);
      }

      setItems(newItems);
      setTodayAppointments(todayAppointmentsList);
      setLoading(false);
    };

    if (!appointmentsLoading && !appointmentsError) { 
      transformSchedule();
    }
  }, [schedule, appointments, appointmentsLoading, appointmentsError]);

  useEffect(() => {
    console.log('Schedule:', schedule);
    console.log('Appointments:', appointments);
    console.log('Today\'s Appointments:', todayAppointments);
    console.log('Selected Date:', selectedDate);
    // ...existing code...
  }, [schedule, appointments, todayAppointments, selectedDate]);

  const renderClassItem = ({ item }: { item: Slot }) => (
    <View style={styles.classItem}>
      <View style={styles.timelineContainer}>
        <View style={styles.timelineDot} />
        <View
          style={[
            styles.timelineLine,
            { backgroundColor: item.isBooked ? item.color || '#e6c39a' : '#226b80' },
          ]}
        />
      </View>

      <View style={styles.classContent}>
        <Text style={styles.timeText}>
          {item.startTime} - {item.endTime ? item.endTime : ''}
        </Text>

        {item.type === 'appointment' ? (
          item.appointment ? (
            <>
              <Text style={styles.cardTitle}>{item.appointment.patientId.name}</Text>
              <Text style={styles.cardDate}>
                {moment(item.appointment.date).format('DD MMM, HH:mm')}
              </Text>
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
      <View></View>
      <Text style={styles.title}>Today's Schedule</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
      ) : (
        <>
                  
          <View style={styles.dateSelectorContainer}>
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
          </View>

          <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>

        
          <FlatList
            contentContainerStyle={styles.contentContainer}
            data={items[moment(selectedDate).format('YYYY-MM-DD')] || []}
            ListHeaderComponent={renderHeader}
            renderItem={renderClassItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No time slots available for this date.</Text>
              </View>
            }
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
    backgroundColor: '#c5f0a4',
  
  },
  header: {
    marginBottom: 16,
    
  },
   dateSelectorContainer: {
    height: 80, 
    paddingVertical: 8,
    backgroundColor: '#ffb03b',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4

  },
  dateButton: {
    padding: 10,
    
    marginRight: 8,
    
    
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
    color: Colors.primary,
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
    marginBottom: 4, 
  },
  timelineLine: {
    width: 2,
    flex: 1, 
  },
  classContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 8,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: '#f7f39a',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  startTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  endTime: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  cardStatus: { 
    fontSize: 12,
    color: Colors.PRIMARY,
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
  
  timeSlotsContainer: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  emptyContainer: {
    height: 200, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.primary,
  },
  card: {
    width: '100%', // Ensure card takes full width
    padding: 10,
    borderRadius: 8,
    // ...removed backgroundColor...
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default ScheduleScreen;

