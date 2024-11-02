import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import appointmentsReducer from './appointmentsSlice';
import patientReducer from './patientSlice'; // Import the patient reducer

const store = configureStore({
  reducer: {
    user: userReducer,
    appointments: appointmentsReducer,
    patient: patientReducer, // Add patient reducer to the store
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
