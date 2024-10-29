// dashboardSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  isLoading: boolean;
}

const initialState: DashboardState = {
  isLoading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setLoading } = dashboardSlice.actions;

export default dashboardSlice.reducer;
