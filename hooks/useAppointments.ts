// src/hooks/useAppointments.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import io, { Socket } from 'socket.io-client';
import PushNotification from 'react-native-push-notification';
import {
    setAppointments,
    setError,
    setLoading,
    setUpcomingAppointments,
    setRequestedAppointments,
    setCompletedAppointments,
} from '@/app/store/appointmentsSlice';
import { selectUser } from '../app/store/userSlice'; // Import your selector for user

const useAppointments = () => {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector((state) => state.appointments);
    const user = useSelector(selectUser); // Use the same selector to access the user

    useEffect(() => {
        const fetchAppointments = async () => {
            dispatch(setLoading(true));
            dispatch(setError(null));

            try {
                const professionalId = user?.professional?._id; // Safely access professionalId
                if (!professionalId) throw new Error('Professional ID not found');

                // Fetch all appointments for the doctor
                const response = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${professionalId}/all`);
                const allData = await response.json();
                console.log('Fetched Appointments:', allData);

                // Dispatch all appointments to Redux state
                dispatch(setAppointments(allData));

                // Filter appointments based on status
                const upcomingAppointments = allData.filter((appointment) => appointment.status === 'confirmed');
                const requestedAppointments = allData.filter((appointment) => appointment.status === 'pending');
                const completedAppointments = allData.filter((appointment) => appointment.status === 'completed');

                // Dispatch filtered appointments to Redux state
                dispatch(setUpcomingAppointments(upcomingAppointments));
                dispatch(setRequestedAppointments(requestedAppointments));
                dispatch(setCompletedAppointments(completedAppointments));
            } catch (err) {
                console.error('Error fetching appointments:', err.message);
                dispatch(setError('Error fetching appointments'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        // Fetch appointments only if the user has a professional role
        if (user && user.professional) { // Check if user is defined and has a professional role
            fetchAppointments();
        }

        // Setting up Socket.IO for real-time updates
        const socket: Socket = io('https://medplus-health.onrender.com');

        socket.on('newAppointment', (appointment) => {
            dispatch(setAppointments((prev) => {
                const exists = prev.some((a) => a._id === appointment._id);
                if (!exists) {
                    return [...prev, appointment];
                }
                return prev;
            }));
            PushNotification.localNotification({
                title: 'New Appointment',
                message: `New appointment with ${appointment.patientName} on ${moment(appointment.createdAt).format('MMMM Do YYYY')} at ${appointment.time}`,
            });
        });

        // Cleanup function to disconnect the socket
        return () => {
            socket.disconnect();
        };
    }, [dispatch, user]); // Add user as a dependency

    // Function to confirm an appointment
    const confirmAppointment = async (appointmentId) => {
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
                // Update the appointment status in Redux state
                dispatch(setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment._id === appointmentId ? { ...appointment, status: 'confirmed' } : appointment
                    )
                ));
            } else {
                throw new Error('Failed to confirm appointment');
            }
        } catch (err) {
            console.error(err);
            dispatch(setError('Error confirming appointment'));
        }
    };

    return {
        appointments,
        loading,
        error,
        confirmAppointment,
    };
};

export default useAppointments;