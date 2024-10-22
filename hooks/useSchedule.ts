import { useState, useEffect } from 'react';
import axios from 'axios';

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
}

const useSchedule = (): UseScheduleHook => {
  const [schedule, setSchedule] = useState<Slot[]>([]);

  const fetchSchedule = async (professionalId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      setSchedule(response.data.slots);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  return {
    schedule,
    fetchSchedule,
  };
};

export default useSchedule;