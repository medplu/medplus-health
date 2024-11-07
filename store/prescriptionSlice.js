import { createSlice } from '@reduxjs/toolkit';

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState: {
    prescriptions: [],
    selectedPrescription: null, // Add selectedPrescription state
  },
  reducers: {
    setPrescriptions(state, action) {
      state.prescriptions = action.payload;
    },
    setSelectedPrescription(state, action) { // Action to set selected prescription
      state.selectedPrescription = action.payload;
    },
    clearSelectedPrescription(state) { // Action to clear selected prescription
      state.selectedPrescription = null;
    },
  },
  extraReducers: (builder) => {
    // Handle async actions like fetchPrescriptionsByPatientId
  },
});

export const { setPrescriptions, setSelectedPrescription, clearSelectedPrescription } = prescriptionSlice.actions;
export const selectPrescriptions = (state) => state.prescriptions.prescriptions;
export const selectSelectedPrescription = (state) => state.prescriptions.selectedPrescription;
export default prescriptionSlice.reducer;
