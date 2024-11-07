import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store/configureStore'; // Add this line

export const fetchPrescriptionsByPatientId = createAsyncThunk(
  'prescriptions/fetchByPatientId',
  async (patientId: string) => {
    const response = await axios.get(`https://medplus-health.onrender.com/api/prescriptions/${patientId}`);
    return response.data.prescriptions;
  }
);

interface PrescriptionState {
  prescriptions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescriptions: [],
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
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptionsByPatientId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prescriptions';
      });
  },
});

export const selectPrescriptions = (state: RootState) => state.prescriptions.prescriptions;
export default prescriptionSlice.reducer;
