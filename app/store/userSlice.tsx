import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/configureStore';

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  user: string;
  profession: string;
  certifications: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  clinic: string;
  attachedToClinic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  name: string | null;
  email: string | null;
  userId: string | null;
  userType: 'client' | 'professional' | 'student' | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  professional: Professional | null;
  profileImage: string | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  userId: null,
  userType: null,
  isLoggedIn: false,
  isAuthenticated: false,
  professional: null,
  profileImage: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        userId: string;
        userType: 'client' | 'professional' | 'student';
        professional?: Professional | null;
        profileImage?: string | null;
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userId = action.payload.userId;
      state.userType = action.payload.userType;
      state.isLoggedIn = true;
      state.isAuthenticated = true;
      state.professional = action.payload.professional || null;
      state.profileImage = action.payload.profileImage || null;
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.userId = null;
      state.userType = null;
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      state.professional = null;
      state.profileImage = null;
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
  },
});

export const selectUser = (state: RootState) => state.user;

export const { login, logout, updateUserProfile } = userSlice.actions;

export default userSlice.reducer;
