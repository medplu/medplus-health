import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';
import appointmentsReducer from './appointmentsSlice';
import scheduleReducer from './scheduleSlice';
import doctorReducer from './doctorSlice';
import clinicsReducer from './clinicSlice';
import patientReducer from './patientSlice'; // Import the patient reducer
import prescriptionReducer from '@/redux/prescriptionSlice'; // Import prescription reducer

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'prescription', 'doctors', 'schedules', 'clinics'], // Add 'prescription' to the whitelist
};

// Combine all reducers into a root reducer
const rootReducer = combineReducers({
  user: userReducer,
  appointments: appointmentsReducer,
  schedules: scheduleReducer,
  doctors: doctorReducer,
  clinics: clinicsReducer,
  patient: patientReducer, 
  prescription: prescriptionReducer, 
});


const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
