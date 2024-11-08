import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './configureStore'; // Corrected import path

export const fetchPrescriptionsByPatientId = createAsyncThunk(
  'prescriptions/fetchByPatientId',
  async (patientId: string) => { // Update parameter to accept patientId string
    console.log('Fetching prescriptions for patientId:', patientId); // Log the patientId
    const response = await axios.get(`https://medplus-health.onrender.com/api/prescriptions/${encodeURIComponent(patientId)}`);
    return response.data.prescription; // Return the single prescription object
  }
);

interface PrescriptionState {
  prescription: any | null; // Change from prescriptions: any[]
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescription: null, // Initialize as null instead of an empty array
  loading: false,
  error: null,
};

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptionsByPatientId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptionsByPatientId.fulfilled, (state, action) => {
        state.loading = false;
        state.prescription = action.payload; // Assign the single prescription object
      })
      .addCase(fetchPrescriptionsByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prescriptions';
      });
  },
});

export const selectPrescription = (state: RootState) => state.prescriptions.prescription; // Update selector
export default prescriptionSlice.reducer;
