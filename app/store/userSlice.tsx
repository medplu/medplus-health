// userSlice.js
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
  profileImage?: string; // Add profileImage to the Professional interface if necessary
}

interface UserState {
  name: string | null;
  email: string | null;
  userType: 'client' | 'professional' | 'student' | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  professional: Professional | null;
  profileImage: string | null; // Add profileImage here
}

const initialState: UserState = {
  name: null,
  email: null,
  userType: null,
  isLoggedIn: false,
  isAuthenticated: false,
  professional: null,
  profileImage: null, // Initialize with null
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
        userType: 'client' | 'professional' | 'student';
        professional?: Professional | null;
        profileImage?: string | null; // Add profileImage to the payload
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userType = action.payload.userType;
      state.isLoggedIn = true;
      state.isAuthenticated = true;
      state.professional = action.payload.professional || null;
      state.profileImage = action.payload.profileImage || null; // Store profileImage
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.userType = null;
      state.isLoggedIn = false;
      state.isAuthenticated = false;
      state.professional = null;
      state.profileImage = null; // Clear profileImage on logout
    },
  },
});

// Selector to get user data from the state
export const selectUser = (state: RootState) => state.user;

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
