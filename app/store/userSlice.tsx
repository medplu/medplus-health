import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/configureStore'; // Adjust the path based on your project structure

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
  userType: 'client' | 'professional' | 'student' | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Add isAuthenticated property
  professional: Professional | null; // Add professional details here
}

const initialState: UserState = {
  name: null,
  email: null,
  userType: null,
  isLoggedIn: false,
  isAuthenticated: false, // Initialize isAuthenticated
  professional: null, // Initialize with null
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
        professional?: Professional | null; // Include professional data if available
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userType = action.payload.userType;
      state.isLoggedIn = true;
      state.isAuthenticated = true; // Set isAuthenticated to true on login
      state.professional = action.payload.professional || null; // Store professional details or set to null
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.userType = null;
      state.isLoggedIn = false;
      state.isAuthenticated = false; // Set isAuthenticated to false on logout
      state.professional = null; // Clear professional details on logout
    },
  },
});

// Selector to get user data from the state
export const selectUser = (state: RootState) => state.user; // Adjust the state path as needed

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;