// app/professional/hooks/useAppointments.ts
import { useState, useEffect } from 'react';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io, { Socket } from 'socket.io-client';
import PushNotification from 'react-native-push-notification';

interface Appointment {
  _id: string;
  patientName: string;
  patientImage?: string;
  date: string;
  time: string;
  status: string;
}

const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = await AsyncStorage.getItem('doctorId'); // Retrieve doctorId from AsyncStorage
        if (!doctorId) {
          throw new Error('Doctor ID not found in AsyncStorage');
        }

        // Fetch upcoming appointments
        const upcomingResponse = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${doctorId}`);
        const upcomingData: Appointment[] = await upcomingResponse.json();

        // Fetch all appointments
        const allResponse = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${doctorId}/all`);
        const allData: Appointment[] = await allResponse.json();

        // Filter for upcoming appointments
        const upcomingAppointments = upcomingData.filter(
          (appointment) => moment(appointment.date).isSameOrAfter(moment(), 'day') && appointment.status === 'confirmed'
        );

        // Filter for recent (overdue) appointments
        const overdueAppointments = allData.filter((appointment) =>
          moment(appointment.date).isBefore(moment(), 'day')
        );

        setAppointments(upcomingAppointments);
        setRecentAppointments(overdueAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Connect to WebSocket server
    const socket: Socket = io('https://medplus-health.onrender.com');

    // Listen for new appointments
    socket.on('newAppointment', (appointment: Appointment) => {
      setAppointments((prevAppointments) => [...prevAppointments, appointment]);
      PushNotification.localNotification({
        title: 'New Appointment',
        message: `New appointment with ${appointment.patientName} on ${moment(appointment.date).format(
          'MMMM Do YYYY'
        )} at ${appointment.time}`,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const confirmAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(
        `https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment._id === appointmentId ? { ...appointment, status: 'confirmed' } : appointment
          )
        );
      } else {
        throw new Error('Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  return {
    appointments,
    recentAppointments,
    loading,
    confirmAppointment,
  };
};

export default useAppointments;