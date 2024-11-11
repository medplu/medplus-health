import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profession: string;
  profileImage: string;
  attachedToClinic: boolean;
  attachedToPharmacy: boolean;
  certifications: any[];
  clinic: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
  pharmacy: any;
  pushNotifications: boolean;
  user: string;
}

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  medicalHistory: any[];
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface Appointment {
  _id: string;
  doctorId: Doctor;
  userId: string;
  patientId: Patient;
  patientName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  time: string;
  timeSlotId: string;
  consultationFee?: number;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
 
}

interface Notification {
  _id: string; 
  patientName: string; 
  time: string; 
  status: string; 
}

interface AppointmentsState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  requestedAppointments: Appointment[];
  completedAppointments: Appointment[];
  notifications: Notification[]; 
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  upcomingAppointments: [],
  requestedAppointments: [],
  completedAppointments: [],
  notifications: [],
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
      state.notifications = action.payload; 
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload); 
    },
    clearNotifications: (state) => {
      state.notifications = [];
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
