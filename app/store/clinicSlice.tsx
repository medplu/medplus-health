import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from '../store/configureStore';

// Define the structure of a clinic
interface Clinic {
  _id: string; // Use the correct field name from your API response
  name: string;
  address: string;
  category: string;
  image?: string; // Optional field
  // Add any other fields as needed
}

interface ClinicsState {
  clinicList: Clinic[];
  filteredClinicList: Clinic[];
  selectedClinic: Clinic | null; // For holding the specific clinic data
  loading: boolean;
  error: string | null;
}

const initialState: ClinicsState = {
  clinicList: [],
  filteredClinicList: [],
  selectedClinic: null, // Initialize as null
  loading: false,
  error: null,
};

// Async thunk for fetching clinics from the API or AsyncStorage
export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async () => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    if (cachedClinics) {
      return JSON.parse(cachedClinics); // Return cached clinics if available
    }

    // Fetch from API if no cached data
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics'); // Adjust the URL as necessary
    await AsyncStorage.setItem('clinicList', JSON.stringify(response.data));
    return response.data;
  }
);

// Async thunk for fetching a specific clinic by ID
export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (clinicId: string) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    const clinics = cachedClinics ? JSON.parse(cachedClinics) : [];

    // Check if the clinic exists in cached clinics
    const cachedClinic = clinics.find((clinic: Clinic) => clinic._id === clinicId);
    if (cachedClinic) {
      return cachedClinic; // Return cached clinic if available
    }

    // Fetch from API if no cached data
    const response = await axios.get(`https://medplus-health.onrender.com/api/clinics/${clinicId}`); // Adjust the URL as necessary
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

      // Filtering locally on the cached data
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
      state.selectedClinic = null; // Clear selected clinic when needed
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
        state.filteredClinicList = action.payload; // Initialize filtered list with all clinics
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
        state.selectedClinic = action.payload; // Store the fetched clinic data
        state.loading = false;
      })
      .addCase(fetchClinicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinic details';
      });
  },
});

// Export actions
export const { filterClinics, clearSelectedClinic  } = clinicsSlice.actions;

// Selectors to access clinic state
export const selectClinics = (state: RootState) => state.clinics.filteredClinicList;
export const selectClinicDetails = (state: RootState) => state.clinics.selectedClinic; // Selector for the selected clinic details
export const selectClinicLoading = (state: RootState) => state.clinics.loading; // Selector for loading state
export const selectClinicError = (state: RootState) => state.clinics.error; // Selector for error state

// Export the reducer
export default clinicsSlice.reducer;
