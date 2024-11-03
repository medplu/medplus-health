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
    addNotification, // Import addNotification
} from '@/app/store/appointmentsSlice';
import { selectUser } from '../app/store/userSlice'; // Import your selector for user

const useAppointments = () => {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector((state) => state.appointments);
    const user = useSelector(selectUser); // Use the selector to access the user

    useEffect(() => {
        const fetchAppointments = async () => {
            dispatch(setLoading(true));
            dispatch(setError(null));

            try {
                if (user) {
                    let response;

                    if (user.professional) {
                        // Fetch all appointments for the doctor
                        const professionalId = user.professional._id; // Safely access professionalId
                        response = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${professionalId}/all`);
                    } else {
                        // Fetch appointments for the user
                        const userId = user.userId; // Access userId
                        response = await fetch(`https://medplus-health.onrender.com/api/appointments/user/${userId}`);
                    }

                    const allData = await response.json();

                    // Ensure that allData is an array
                    const appointmentsArray = Array.isArray(allData) ? allData : [];
                    dispatch(setAppointments(appointmentsArray));

                    // Filter appointments based on status
                    const upcomingAppointments = appointmentsArray.filter((appointment) => appointment.status === 'confirmed');
                    const requestedAppointments = appointmentsArray.filter((appointment) => appointment.status === 'pending');
                    const completedAppointments = appointmentsArray.filter((appointment) => appointment.status === 'completed');

                    // Dispatch filtered appointments to Redux state
                    dispatch(setUpcomingAppointments(upcomingAppointments));
                    dispatch(setRequestedAppointments(requestedAppointments));
                    dispatch(setCompletedAppointments(completedAppointments));
                }
            } catch (err) {
                console.error('Error fetching appointments:', err.message);
                dispatch(setError('Error fetching appointments'));
            } finally {
                dispatch(setLoading(false));
            }
        };

        // Fetch appointments only if the user is defined
        if (user) {
            fetchAppointments();
        }

        // Setting up Socket.IO for real-time updates
        const socket: Socket = io('https://medplus-health.onrender.com');

        socket.on('newAppointment', ({ appointment, userId, doctorId }) => {
            // Check if the notification is for the current user
            if (user._id === userId || (user.professional && user.professional._id === doctorId)) {
                dispatch(setAppointments((prev) => {
                    const exists = prev.some((a) => a._id === appointment._id);
                    if (!exists) {
                        return [...prev, appointment];
                    }
                    return prev;
                }));

                // Dispatch addNotification with relevant details
                dispatch(addNotification({
                    _id: appointment._id,
                    patientName: appointment.patientName,
                    date: moment(appointment.createdAt).format('MMMM Do YYYY'),
                    time: appointment.time, // Ensure time is included
                    status: appointment.status, // Include status
                }));

                // Use the correct PushNotification method
                PushNotification.localNotification({
                    title: 'New Appointment',
                    message: `New appointment with ${appointment.patientName} on ${moment(appointment.createdAt).format('MMMM Do YYYY')} at ${appointment.time}`,
                });
            }
        });

        socket.on('cancelAppointment', ({ appointmentId, userId, doctorId }) => {
            if (user._id === userId || (user.professional && user.professional._id === doctorId)) {
                dispatch(setAppointments((prev) => prev.filter((a) => a._id !== appointmentId)));

                // Dispatch addNotification with relevant details
                dispatch(addNotification({
                    _id: appointmentId,
                    patientName: 'Appointment Cancelled',
                    date: moment().format('MMMM Do YYYY'),
                    time: '',
                    status: 'cancelled',
                }));

                PushNotification.localNotification({
                    title: 'Appointment Cancelled',
                    message: `An appointment has been cancelled.`,
                });
            }
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

    // Function to cancel an appointment
    const cancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(
                `https://medplus-health.onrender.com/api/appointments/cancel/${appointmentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                dispatch(setAppointments((prev) =>
                    prev.filter((appointment) => appointment._id !== appointmentId)
                ));
            } else {
                throw new Error('Failed to cancel appointment');
            }
        } catch (err) {
            console.error(err);
            dispatch(setError('Error cancelling appointment'));
        }
    };

    return {
        appointments,
        loading,
        error,
        confirmAppointment,
        cancelAppointment,
    };
};

export default useAppointments;
