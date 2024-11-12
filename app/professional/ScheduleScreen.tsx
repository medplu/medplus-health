import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Platform } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments'; 
import { selectUser } from '../store/userSlice';
import Colors from '../../components/Shared/Colors';
import axios from 'axios'; 
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  endTime: string; // Changed from boolean to string
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
  const { schedule, fetchSchedule, createOrUpdateSchedule } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ [key: string]: Slot[] }>({});
  const [todayAppointments, setTodayAppointments] = useState<Slot[]>([]);
  const [scheduleFetched, setScheduleFetched] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('');
  const [newSlotEndTime, setNewSlotEndTime] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [slotDuration, setSlotDuration] = useState<number>(60);

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
                ? `Appointment with ${associatedAppointment.patientId.name}` // Added backticks
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
    
  }, [schedule, appointments, todayAppointments, selectedDate]);

  const showDatePicker = () => {
    if (Platform.OS === 'web') {
      setDatePickerVisibility(true);
    } else {
      setDatePickerVisibility(true);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    setSelectedDateState(date);
    setNewSlotDate(moment(date).format('YYYY-MM-DD'));
    hideDatePicker();
  };

  const showStartTimePicker = () => {
    if (Platform.OS === 'web') {
      setStartTimePickerVisibility(true);
    } else {
      setStartTimePickerVisibility(true);
    }
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const handleConfirmStartTime = (time: Date) => {
    setSelectedStartTime(time);
    setNewSlotStartTime(moment(time).format('HH:mm'));
    hideStartTimePicker();
  };

  const showEndTimePicker = () => {
    if (Platform.OS === 'web') {
      setEndTimePickerVisibility(true);
    } else {
      setEndTimePickerVisibility(true);
    }
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleConfirmEndTime = (time: Date) => {
    setSelectedEndTime(time);
    setNewSlotEndTime(moment(time).format('HH:mm'));
    hideEndTimePicker();
  };

  const handleCreateSlot = async () => {
    const professionalId = user?.professional?._id;
    if (!professionalId) return;
  
    if (!newSlotDate || !newSlotStartTime || !newSlotEndTime) {
      console.error('All fields are required.');
      return;
    }
  
    const start = moment(`${newSlotDate} ${newSlotStartTime}`, 'YYYY-MM-DD HH:mm');
    const end = moment(`${newSlotDate} ${newSlotEndTime}`, 'YYYY-MM-DD HH:mm');
  
    if (!start.isBefore(end)) {
      console.error('Start time must be before end time.');
      return;
    }
  
    const availability: Slot[] = [];
    let current = start.clone();
  
    while (current.add(0, 'minutes').isBefore(end)) {
      const slotEnd = current.clone().add(slotDuration, 'minutes');
      if (slotEnd.isAfter(end)) break;
  
      availability.push({
        date: current.format('YYYY-MM-DD'),
        startTime: current.format('HH:mm'),
        endTime: slotEnd.format('HH:mm'),
        isBooked: false,
        _id: '',
      });
  
      current = slotEnd;
    }
  
    if (recurrence === 'none') {
      await createOrUpdateSchedule(professionalId, availability);
    } else {
      await axios.post('https://medplus-health.onrender.com/api/schedule/createRecurringSlots', {
        professionalId,
        slots: availability,
        recurrence,
      });
    }
  
    setIsModalVisible(false);
    setNewSlotDate('');
    setNewSlotStartTime('');
    setNewSlotEndTime('');
    setSelectedDateState(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setRecurrence('none');
    setSlotDuration(60);
  };

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

        {item.isBooked ? (
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
          <Text style={styles.cardTitle}>Available Slot</Text>
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
      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>Set a Schedule</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Slot</Text>

            {Platform.OS === 'web' ? (
              <DatePicker
                selected={selectedDateState}
                onChange={(date: Date) => handleConfirmDate(date)}
                dateFormat="yyyy-MM-dd"
                className="web-datepicker"
              />
            ) : (
              <TouchableOpacity onPress={showDatePicker} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>
                  {selectedDateState ? moment(selectedDateState).format('YYYY-MM-DD') : 'Select Date'}
                </Text>
              </TouchableOpacity>
            )}
            {Platform.OS !== 'web' && (
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
              />
            )}

            {Platform.OS === 'web' ? (
              <DatePicker
                selected={selectedStartTime}
                onChange={(time: Date) => handleConfirmStartTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                className="web-timepicker"
              />
            ) : (
              <TouchableOpacity onPress={showStartTimePicker} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>
                  {selectedStartTime ? moment(selectedStartTime).format('HH:mm') : 'Select Start Time'}
                </Text>
              </TouchableOpacity>
            )}
            {Platform.OS !== 'web' && (
              <DateTimePickerModal
                isVisible={isStartTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmStartTime}
                onCancel={hideStartTimePicker}
                headerTextIOS="Work start at:"
              />
            )}

            {Platform.OS === 'web' ? (
              <DatePicker
                selected={selectedEndTime}
                onChange={(time: Date) => handleConfirmEndTime(time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                className="web-timepicker"
              />
            ) : (
              <TouchableOpacity onPress={showEndTimePicker} style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>
                  {selectedEndTime ? moment(selectedEndTime).format('HH:mm') : 'Select End Time'}
                </Text>
              </TouchableOpacity>
            )}
            {Platform.OS !== 'web' && (
              <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmEndTime}
                onCancel={hideEndTimePicker}
                headerTextIOS="Work ends at"
              />
            )}

            <View style={styles.recurrenceContainer}>
              <Text style={styles.recurrenceLabel}>Repeat:</Text>
              <Picker
                selectedValue={recurrence}
                onValueChange={(itemValue) => setRecurrence(itemValue as 'none' | 'weekly' | 'monthly')}
                style={styles.picker}
              >
                <Picker.Item label="None" value="none" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
              </Picker>
            </View>

            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Slot Duration (minutes):</Text>
              <Picker
                selectedValue={slotDuration}
                onValueChange={(itemValue) => setSlotDuration(itemValue as number)}
                style={styles.picker}
              >
                <Picker.Item label="30" value={30} />
                <Picker.Item label="60" value={60} />
                <Picker.Item label="90" value={90} />
              </Picker>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateSlot}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5f0a4',
  
  },
  header: {
    marginBottom: 16,
    
  },
   dateSelectorContainer: {
    height: 80, 
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 99, 71, 0.4)', 
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
    width: '100%',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 99, 71, 0.4)', 
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#dce775',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    marginBottom: 10,
    
  },
  pickerButtonText: {
    color: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.gray,
   
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recurrenceLabel: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 10,
  },
  
});

export default ScheduleScreen;