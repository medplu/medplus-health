import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';
import { createSelector } from 'reselect';

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { dispatch }) => {
    const cachedDoctors = await AsyncStorage.getItem('doctorList');
    if (cachedDoctors) {
      const parsedDoctors = JSON.parse(cachedDoctors);
      fetchFreshDoctors();
      return parsedDoctors;
    }
    const response = await axios.get('http://localhost:3000/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
    return response.data;
  }
);

const fetchFreshDoctors = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
  } catch (error) {
    console.error('Failed to fetch fresh doctors', error);
  }
};

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

export const selectDoctors = createSelector(
  (state: RootState) => state.doctors.doctorList,
  (doctorList) => doctorList
);

export default doctorsSlice.reducer;
