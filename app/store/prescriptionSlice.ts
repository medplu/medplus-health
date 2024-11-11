import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from './configureStore';

export const fetchPrescriptionsByPatientId = createAsyncThunk(
  'prescriptions/fetchByPatientId',
  async (patientId: string) => {
    console.log('Fetching prescriptions for patientId:', patientId);
    const response = await axios.get(`https://medplus-health.onrender.com/api/prescriptions/${encodeURIComponent(patientId)}`);
    return response.data.prescription;
  }
);

interface PrescriptionState {
  prescription: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescription: null,
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
        state.prescription = action.payload;
      })
      .addCase(fetchPrescriptionsByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prescriptions';
      });
  },
});

export const selectPrescription = (state: RootState) => state.prescriptions.prescription;
export default prescriptionSlice.reducer;
