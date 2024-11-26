import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Slot {
  _id: string;
  date: string;
  startTime: string; // Changed from 'time' to 'startTime'
  endTime: string;   // Added 'endTime'
  isBooked: boolean;
  appointmentId?: string | null; // Added to align with backend
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
  createOrUpdateSchedule: (professionalId: string, availability: Slot[]) => Promise<void>;
  createRecurringSlots: (professionalId: string, slot: Slot, recurrence: string) => Promise<void>;
  subscribeToScheduleUpdates: (professionalId: string) => void;
  updateSlot: (slotId: string, updates: Partial<Slot>) => Promise<void>; // Added updateSlot method
  clearCache: () => Promise<void>; // Added clearCache method
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

  useEffect(() => {
    if (professionalId) {
      fetchSchedule(professionalId);
    }
  }, [professionalId]);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const cachedSchedule = await AsyncStorage.getItem(`schedule_${professionalId}`);
      if (cachedSchedule) {
        setSchedule(JSON.parse(cachedSchedule));
      } else {
        const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
        if (response.status === 200 && response.data.slots) {
          setSchedule(response.data.slots);
          await AsyncStorage.setItem(`schedule_${professionalId}`, JSON.stringify(response.data.slots));
        } else {
          console.error('Failed to fetch schedule:', response.data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createOrUpdateSchedule = async (professionalId: string, availability: Slot[]) => {
    try {
      const response = await axios.put(`https://medplus-health.onrender.com/api/schedule`, {
        professionalId,
        availability,
      });
      if (response.status === 200) {
        fetchSchedule(professionalId);
      } else {
        console.error('Failed to create or update schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating or updating schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createRecurringSlots = async (professionalId: string, slot: Slot, recurrence: string) => {
    try {
      const response = await axios.post(`https://medplus-health.onrender.com/api/schedule/create-recurring`, {
        professionalId,
        slot,
        recurrence,
      });
      if (response.status === 200) {
        fetchSchedule(professionalId);
      } else {
        console.error('Failed to create recurring slots:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating recurring slots:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const subscribeToScheduleUpdates = (professionalId: string) => {
    const socket = new WebSocket(`wss://medplus-health.onrender.com/schedule/${professionalId}`);
    socket.onmessage = (event) => {
      const updatedSchedule = JSON.parse(event.data);
      setSchedule(updatedSchedule);
    };
  };

  const updateSlot = async (slotId: string, updates: Partial<Slot>) => {
    try {
      const updatedSchedule = schedule.map(slot =>
        slot._id === slotId ? { ...slot, ...updates } : slot
      );
      setSchedule(updatedSchedule);
      await AsyncStorage.setItem(`schedule_${professionalId}`, JSON.stringify(updatedSchedule));
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(`schedule_${professionalId}`);
      console.log('Schedule cache cleared.');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return {
    schedule,
    fetchSchedule,
    createOrUpdateSchedule,
    createRecurringSlots,
    subscribeToScheduleUpdates,
    updateSlot,
    clearCache, // Expose clearCache method
  };
};

export default useSchedule;