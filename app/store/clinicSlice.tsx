import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';

interface Clinic {
  _id: string;
  name: string;
  address: string;
  category: string;
  image?: string;
}

interface ClinicsState {
  clinicList: Clinic[];
  filteredClinicList: Clinic[];
  selectedClinic: Clinic | null;
  loading: boolean;
  error: string | null;
}

const initialState: ClinicsState = {
  clinicList: [],
  filteredClinicList: [],
  selectedClinic: null,
  loading: false,
  error: null,
};

const fetchFreshClinics = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    await AsyncStorage.setItem('clinicList', JSON.stringify(response.data));
  } catch (error) {
    console.error('Failed to fetch fresh clinics', error);
  }
};

export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async (_, { dispatch }) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    if (cachedClinics) {
      const parsedClinics = JSON.parse(cachedClinics);
      fetchFreshClinics();
      return parsedClinics;
    }
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    await AsyncStorage.setItem('clinicList', JSON.stringify(response.data));
    return response.data;
  }
);

export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (clinicId: string) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    const clinics = cachedClinics ? JSON.parse(cachedClinics) : [];

    const cachedClinic = clinics.find((clinic: Clinic) => clinic._id === clinicId);
    if (cachedClinic) {
      return cachedClinic;
    }

    const response = await axios.get(`https://medplus-health.onrender.com/api/clinics/${clinicId}`);
    return response.data;
  }
);

const clinicsSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    filterClinics: (state, action: PayloadAction<{ searchQuery: string }>) => {
      const { searchQuery } = action.payload;
      let filtered = state.clinicList;

      if (searchQuery) {
        filtered = filtered.filter((clinic) =>
          (clinic.name && clinic.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.address && clinic.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.category && clinic.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      state.filteredClinicList = filtered;
    },
    clearSelectedClinic: (state) => {
      state.selectedClinic = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action: PayloadAction<Clinic[]>) => {
        state.clinicList = action.payload;
        state.filteredClinicList = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinics';
      })
      .addCase(fetchClinicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.selectedClinic = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinic details';
      });
  },
});

export const { filterClinics, clearSelectedClinic } = clinicsSlice.actions;

export const selectClinics = (state: RootState) => state.clinics.filteredClinicList;
export const selectClinicDetails = (state: RootState) => state.clinics.selectedClinic;
export const selectClinicLoading = (state: RootState) => state.clinics.loading;
export const selectClinicError = (state: RootState) => state.clinics.error;

export default clinicsSlice.reducer;
