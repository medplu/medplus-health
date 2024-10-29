// doctorsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';

// Async thunk for fetching doctors from the API or AsyncStorage
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { getState }) => {
    const cachedDoctors = await AsyncStorage.getItem('doctorList');
    if (cachedDoctors) {
      return JSON.parse(cachedDoctors); // Return cached doctors if available
    }
    
    // Fetch from API if no cached data
    const response = await axios.get('https://medplus-health.onrender.com/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
    return response.data;
  }
);

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  consultationFee: number;
  // Add any other fields as needed
}

interface DoctorsState {
  doctorList: Doctor[];
  filteredDoctorList: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  doctorList: [],
  filteredDoctorList: [],
  loading: false,
  error: null,
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    filterDoctors: (state, action: PayloadAction<{ searchQuery: string; selectedCategory: string }>) => {
      const { searchQuery, selectedCategory } = action.payload;
      let filtered = state.doctorList;

      // Filtering locally on the cached data
      if (searchQuery) {
        filtered = filtered.filter((doctor) =>
          (doctor.firstName && doctor.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (doctor.lastName && doctor.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (doctor.category && doctor.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      if (selectedCategory) {
        filtered = filtered.filter((doctor) => doctor.category === selectedCategory);
      }
      state.filteredDoctorList = filtered;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.doctorList = action.payload;
        state.filteredDoctorList = action.payload; // Initialize filtered list with all doctors
        state.loading = false;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load doctors';
      });
  },
});

export const { filterDoctors } = doctorsSlice.actions;
export const selectDoctors = (state: RootState) => state.doctors.filteredDoctorList;

export default doctorsSlice.reducer;