// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';
import appointmentsReducer from './appointmentsSlice';
import scheduleReducer from './scheduleSlice';
import doctorReducer from './doctorSlice'; // Import doctorSlice reducer
import clinicsReducer from './clinicSlice'; // Import the clinics reducer
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'], // Persist only the user slice data here
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    appointments: appointmentsReducer,
    schedules: scheduleReducer,
    doctors: doctorReducer, // Add doctorReducer to store configuration
    clinics: clinicsReducer, // Add the clinics reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
