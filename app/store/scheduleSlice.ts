// scheduleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchSchedule = createAsyncThunk('schedule/fetchSchedule', async (professionalId: string) => {
  const response = await fetch(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
  return response.json();
});

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: {
    items: {},
    loading: false,
    error: null,
  },
  reducers: {
    updateSchedule: (state, action) => {
      const { date, slots } = action.payload;
      if (!state.items[date]) {
        state.items[date] = [];
      }
      state.items[date].push(slots);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;
