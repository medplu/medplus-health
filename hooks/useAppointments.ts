import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import io, { Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import {
    setAppointments,
    setError,
    setLoading,
    setUpcomingAppointments,
    setRequestedAppointments,
    setCompletedAppointments,
    addNotification,
} from '@/app/store/appointmentsSlice';
import { selectUser } from '../app/store/userSlice';

// Configure Notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const useAppointments = () => {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector((state) => state.appointments);
    const user = useSelector(selectUser);
    
    // Define professionalId in the global scope of the hook
    const professionalId = user?.professional?._id;

    useEffect(() => {
        const fetchAppointments = async () => {
            dispatch(setLoading(true));
            dispatch(setError(null));
        
            try {
                if (user) {
                    let response;
        
                    if (user.professional) {
                        const professionalId = user.professional._id;
                        // Use the getAppointmentsByDoctor route instead of /all
                        response = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${professionalId}`);
                    } else {
                        const userId = user.userId;
                        response = await fetch(`https://medplus-health.onrender.com/api/appointments/user/${userId}`);
                    }
        
                    const allData = await response.json();
                    const appointmentsArray = Array.isArray(allData) ? allData : [];
                    dispatch(setAppointments(appointmentsArray));
        
                    // Log fetched appointments
                    console.log('Fetched Appointments:', appointmentsArray);
        
                    // Get current date and time
                    const now = moment();
        
                    // Filter upcoming appointments by date and status
                    const upcomingAppointments = appointmentsArray.filter(
                        (appointment) =>
                            appointment.status === 'confirmed' &&
                            moment(appointment.date).isSameOrAfter(now, 'day')
                    );
        
                    const requestedAppointments = appointmentsArray.filter((appointment) => appointment.status === 'pending');
                    const completedAppointments = appointmentsArray.filter((appointment) => appointment.status === 'completed');
        
                    // Log filtered appointments
                    console.log('Upcoming Appointments:', upcomingAppointments);
                    console.log('Requested Appointments:', requestedAppointments);
                    console.log('Completed Appointments:', completedAppointments);
        
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
        

        if (user) {
            fetchAppointments();
        }

        const socket: Socket = io('https://medplus-health.onrender.com');

        socket.on('newAppointment', ({ appointment, userId, doctorId }) => {
            if (user._id === userId || (user.professional && user.professional._id === doctorId)) {
                dispatch(setAppointments((prev) => {
                    const exists = prev.some((a) => a._id === appointment._id);
                    if (!exists) {
                        return [...prev, appointment];
                    }
                    return prev;
                }));

                dispatch(addNotification({
                    _id: appointment._id,
                    patientName: appointment.patientName,
                    date: moment(appointment.createdAt).format('MMMM Do YYYY'),
                    time: appointment.time,
                    status: appointment.status,
                }));

                Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'New Appointment',
                        body: `New appointment with ${appointment.patientName} on ${moment(appointment.createdAt).format('MMMM Do YYYY')} at ${appointment.time}`,
                    },
                    trigger: null,
                });
            }
        });

        socket.on('cancelAppointment', ({ appointmentId, userId, doctorId }) => {
            if (user._id === userId || (user.professional && user.professional._id === doctorId)) {
                dispatch(setAppointments((prev) => prev.filter((a) => a._id !== appointmentId)));

                dispatch(addNotification({
                    _id: appointmentId,
                    patientName: 'Appointment Cancelled',
                    date: moment().format('MMMM Do YYYY'),
                    time: '',
                    status: 'cancelled',
                }));

                Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Appointment Cancelled',
                        body: `An appointment has been cancelled.`,
                    },
                    trigger: null,
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch, user]);

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

    // New function to fetch appointments by doctor using the getAppointmentsByDoctor route
    const fetchAppointmentsByDoctor = async () => {
        // Ensure professionalId is available
        if (!professionalId) {
            console.error('Professional ID is not defined.');
            dispatch(setError('Professional ID is missing.'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const response = await fetch(`https://medplus-health.onrender.com/api/appointments/doctor/${professionalId}`);
            const data = await response.json();
            console.log('Raw Data:', data); // Added logging for raw data
            const appointmentsArray = Array.isArray(data) ? data : [];
            dispatch(setAppointments(appointmentsArray));

            // Log fetched appointments
            console.log('Fetched Appointments by Doctor:', appointmentsArray);

            // Get current date and time
            const now = moment();

            // Filter upcoming appointments by date and status
            const upcomingAppointments = appointmentsArray.filter(
                (appointment) =>
                    appointment.status === 'confirmed' &&
                    moment(appointment.date).isSameOrAfter(now, 'day')
            );

            const requestedAppointments = appointmentsArray.filter(
                (appointment) => appointment.status === 'pending'
            );
            const completedAppointments = appointmentsArray.filter(
                (appointment) => appointment.status === 'completed'
            );

            // Log filtered appointments
            console.log('Upcoming Appointments:', upcomingAppointments);
            console.log('Requested Appointments:', requestedAppointments);
            console.log('Completed Appointments:', completedAppointments);

            // Dispatch filtered appointments to Redux state
            dispatch(setUpcomingAppointments(upcomingAppointments));
            dispatch(setRequestedAppointments(requestedAppointments));
            dispatch(setCompletedAppointments(completedAppointments));
        } catch (err) {
            console.error('Error fetching appointments by doctor:', err.message);
            dispatch(setError('Error fetching appointments by doctor'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        appointments,
        loading,
        error,
        confirmAppointment,
        cancelAppointment,
        fetchAppointmentsByDoctor, // Expose the new function
    };
};

export default useAppointments;
