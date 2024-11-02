import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './configureStore'; // Adjust the path based on your project structure

// Define the Patient interface
interface Patient {
  _id: string;
  image: string;
  gender: string;
  email: string;
  prescriptions: string[];
  diagnoses: string[];
  treatment: string[];
  labTests: string[];
  // Add other relevant fields as needed
}

// Define the PatientState interface
interface PatientState {
  patients: { [key: string]: Patient };
  loading: boolean;
  error: string | null;
}

// Initialize the state
const initialState: PatientState = {
  patients: {},
  loading: false,
  error: null,
};

// Async thunk to fetch patient by ID
export const fetchPatientById = createAsyncThunk<
  Patient,
  string,
  { rejectValue: string }
>('patient/fetchPatientById', async (patientId, thunkAPI) => {
  try {
    const response = await fetch(`https://api.example.com/clients/${patientId}`);
    if (!response.ok) {
      return thunkAPI.rejectWithValue('Failed to fetch patient data.');
    }
    const data: Patient = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue('An error occurred while fetching patient data.');
  }
});

// Create the patient slice
const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.patients[action.payload._id] = action.payload;
        state.loading = false;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch patient data.';
      });
  },
});

// Selectors
export const selectPatientById = (state: RootState, patientId: string) =>
  state.patient.patients[patientId];
export const selectPatientLoading = (state: RootState) => state.patient.loading;
export const selectPatientError = (state: RootState) => state.patient.error;

export default patientSlice.reducer;
