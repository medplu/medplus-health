// src/store/appointmentsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Appointment {
  _id: string;
  doctorId: string;
  userId: string;
  patientName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  requestedAppointments: Appointment[];
  completedAppointments: Appointment[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  upcomingAppointments: [],
  requestedAppointments: [],
  completedAppointments: [],
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
  },
});

export const {
  setAppointments,
  setUpcomingAppointments,
  setRequestedAppointments,
  setCompletedAppointments,
  setLoading,
  setError,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;