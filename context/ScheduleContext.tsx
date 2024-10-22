import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
}

interface ScheduleContextType {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC = ({ children }) => {
  const [schedule, setSchedule] = useState<Slot[]>([]);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const response = await fetch(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      const data = await response.json();
      setSchedule(data.slots);
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
      }
    };

    fetchData();
  }, []);

  return (
    <ScheduleContext.Provider value={{ schedule, fetchSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};