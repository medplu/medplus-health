import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { Provider, Dialog, Portal, IconButton } from 'react-native-paper';


// Define types for the schedule and new slot
interface Slot {
  time: string;
  place: string;
}

interface Schedule {
  Monday: Slot[];
  Tuesday: Slot[];
  Wednesday: Slot[];
  Thursday: Slot[];
  Friday: Slot[];
}

interface DoctorScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (schedule: Schedule) => void;
}

const DoctorScheduleModal: React.FC<DoctorScheduleModalProps> = ({ open, onClose, onSave }) => {
  const [schedule, setSchedule] = useState<Schedule>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });

  const [newSlot, setNewSlot] = useState<Slot>({ time: '', place: '' });
  const [selectedDay, setSelectedDay] = useState<keyof Schedule>('Monday');

  const handleAddSlot = () => {
    if (selectedDay && newSlot.time && newSlot.place) {
      setSchedule((prev) => ({
        ...prev,
        [selectedDay]: [...prev[selectedDay], newSlot],
      }));
      setNewSlot({ time: '', place: '' });
    }
  };

  const handleSave = () => {
    onSave(schedule); // Save the schedule when clicking 'Save'
  };

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose}>
        <Dialog.Title>Set Your Schedule</Dialog.Title>
        <Dialog.Content>
          {Object.keys(schedule).map((day) => (
            <View key={day}>
              <Text>{day}</Text>
              {schedule[day as keyof Schedule].map((slot, index) => (
                <Text key={index}>
                  {slot.time} - {slot.place}
                </Text>
              ))}
              <TextInput
                label="Time Slot"
                value={newSlot.time}
                onChangeText={(text) => setNewSlot((prev) => ({ ...prev, time: text }))}
                placeholder="e.g. 4:00pm-5:00pm"
                style={{ marginBottom: 8 }}
              />
              <TextInput
                label="Place"
                value={newSlot.place}
                onChangeText={(text) => setNewSlot((prev) => ({ ...prev, place: text }))}
                placeholder="e.g. Matta Hospitals"
                style={{ marginBottom: 8 }}
              />
              <IconButton icon="plus" onPress={handleAddSlot} />
            </View>
          ))}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose} title="Cancel" />
          <Button onPress={handleSave} title="Save" />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const App = () => (
  <Provider>
    <DoctorScheduleModal open={true} onClose={() => {}} onSave={(schedule) => {}} />
  </Provider>
);

export default App;