import { createSlice } from '@reduxjs/toolkit';

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState: null,
  reducers: {
    setPrescription: (state, action) => action.payload,
    clearPrescription: () => null,
  },
});

export const { setPrescription, clearPrescription } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
