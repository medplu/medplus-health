import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';

// Async thunk for fetching doctors from the API or AsyncStorage
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { dispatch }) => {
    // Fetch from AsyncStorage
    const cachedDoctors = await AsyncStorage.getItem('doctorList');
    if (cachedDoctors) {
      // Parse and return cached doctors
      const parsedDoctors = JSON.parse(cachedDoctors);
      
      // Trigger a background fetch for the latest data
      fetchFreshDoctors(); // Call the background fetch function
      
      return parsedDoctors; // Return cached doctors immediately
    }

    // If no cached data, fetch from API
    const response = await axios.get('https://medplus-health.onrender.com/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
    return response.data;
  }
);

// Function to fetch fresh doctors and update the cache
const fetchFreshDoctors = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
  } catch (error) {
    console.error('Failed to fetch fresh doctors', error);
    // Optionally, handle error, e.g., dispatch a notification
  }
};

// Slice definition and reducer logic
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  consultationFee: number;
}

interface DoctorsState {
  doctorList: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  doctorList: [],
  loading: false,
  error: null,
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.doctorList = action.payload;
        state.loading = false;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load doctors';
      });
  },
});

// Selectors
export const selectDoctors = (state: RootState) => state.doctors.doctorList;

export default doctorsSlice.reducer;
