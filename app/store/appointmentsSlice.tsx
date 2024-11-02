import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Appointment {
  _id: string;
  doctorId: string;
  userId: string;
  patientName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    // Add other patient details as needed
  };
}

interface Notification {
  _id: string; // Unique ID for the notification
  patientName: string; // Name of the patient for the notification
  date: string; // Appointment date
  time: string; // Appointment time
}

interface AppointmentsState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  requestedAppointments: Appointment[];
  completedAppointments: Appointment[];
  notifications: Notification[]; // New state for notifications
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  upcomingAppointments: [],
  requestedAppointments: [],
  completedAppointments: [],
  notifications: [], // Initialize notifications state
  loading: false,
  error: null,
};

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    setUpcomingAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.upcomingAppointments = action.payload;
    },
    setRequestedAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.requestedAppointments = action.payload;
    },
    setCompletedAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.completedAppointments = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload; // Set notifications in the state
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload); // Add a single notification
    },
    clearNotifications: (state) => {
      state.notifications = []; // Clear notifications
    },
  },
});

// Selectors
export const selectAppointments = (state: { appointments: AppointmentsState }) => state.appointments.appointments;
export const selectUpcomingAppointments = (state: { appointments: AppointmentsState }) => state.appointments.upcomingAppointments;
export const selectRequestedAppointments = (state: { appointments: AppointmentsState }) => state.appointments.requestedAppointments;
export const selectCompletedAppointments = (state: { appointments: AppointmentsState }) => state.appointments.completedAppointments;
export const selectNotifications = (state: { appointments: AppointmentsState }) => state.appointments.notifications;

export const {
  setAppointments,
  setUpcomingAppointments,
  setRequestedAppointments,
  setCompletedAppointments,
  setLoading,
  setError,
  setNotifications,
  addNotification,
  clearNotifications,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
