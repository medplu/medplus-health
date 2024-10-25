import { useState, useEffect } from 'react';
import axios from 'axios';

interface Slot {
  date: string;
  time: string;
  isBooked: boolean;
  _id: string; // Ensure _id is part of the Slot type
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
}

const useSchedule = (): UseScheduleHook => {
  const [schedule, setSchedule] = useState<Slot[]>([]);

  const fetchSchedule = async (professionalId: string) => {
    if (!validateProfessionalId(professionalId)) {
      console.error('Invalid professional ID format');
      return;
    }

    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      if (response.data.status === 'Success' && response.data.slots) {
        setSchedule(response.data.slots);
        console.log('Fetched schedule:', response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const validateProfessionalId = (id: string): boolean => {
    // Add your validation logic here (e.g., regex for ObjectId format)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };

  return {
    schedule,
    fetchSchedule,
  };
};

export default useSchedule;