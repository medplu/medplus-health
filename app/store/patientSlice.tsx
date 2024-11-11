import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './configureStore';

interface Patient {
  _id: string;
  image: string;
  gender: string;
  email: string;
  prescriptions: string[];
  diagnoses: string[];
  treatment: string[];
  labTests: string[];
  name: string;
  medicalHistory: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MedicalHistory {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  familyHistory: string;
  socialHistory: string;
  medications: string;
  allergies: string;
  reviewOfSystems: string;
}

interface PatientState {
  patients: { [key: string]: Patient };
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: {},
  loading: false,
  error: null,
};

export const fetchPatientById = createAsyncThunk<
  Patient,
  string,
  { rejectValue: string }
>('patient/fetchPatientById', async (patientId, thunkAPI) => {
  try {
    const response = await fetch(`https://medplus-health.onrender.com/api/patients/${patientId}`);
    if (!response.ok) {
      return thunkAPI.rejectWithValue('Failed to fetch patient data.');
    }
    const data: Patient = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue('An error occurred while fetching patient data.');
  }
});

export const saveMedicalHistory = createAsyncThunk<
  void,
  MedicalHistory,
  { rejectValue: string }
>('patient/saveMedicalHistory', async (medicalHistory, thunkAPI) => {
  try {
    const response = await fetch('https://medplus-health.onrender.com/api/medicalHistory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicalHistory),
    });
    if (!response.ok) {
      return thunkAPI.rejectWithValue('Failed to save medical history.');
    }
  } catch (error) {
    return thunkAPI.rejectWithValue('An error occurred while saving medical history.');
  }
});

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
      })
      .addCase(saveMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveMedicalHistory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to save medical history.';
      });
  },
});

export const selectPatientById = (state: RootState, patientId: string) =>
  state.patient.patients[patientId];
export const selectPatientLoading = (state: RootState) => state.patient.loading;
export const selectPatientError = (state: RootState) => state.patient.error;

export default patientSlice.reducer;
