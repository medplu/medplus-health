import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  gender: string;
  email: string;
}

const initialState: UserState = {
  id: '',
  firstName: '',
  lastName: '',
  profileImage: '',
  gender: '',
  email: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserState>) {
      return action.payload;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const { setUser, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;
