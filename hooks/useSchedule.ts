import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
  _id: string; 
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
}

const useSchedule = (): UseScheduleHook => {
  const [schedule, setSchedule] = useState<Slot[]>([]);
  const [professionalId, setProfessionalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfessionalId = async () => {
      try {
        const storedProfessionalId = await AsyncStorage.getItem('professionalId');
        setProfessionalId(storedProfessionalId);
        if (storedProfessionalId) {
          fetchSchedule(storedProfessionalId);
        }
      } catch (error) {
        console.error('Error fetching professional ID from AsyncStorage:', error);
      }
    };

    fetchProfessionalId();
  }, []);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  return {
    schedule,
    fetchSchedule,
  };
};

export default useSchedule;