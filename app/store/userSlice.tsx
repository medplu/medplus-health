import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store/configureStore'; // Adjust the path based on your project structure

// Define the Professional interface
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

// Define the UserState interface
interface UserState {
  name: string | null;
  email: string | null;
  userId: string | null; // Add userId property
  userType: 'client' | 'professional' | 'student' | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Tracks if the user is authenticated
  professional: Professional | null; // Holds professional details
  profileImage: string | null; // Holds profile image URL
}

// Initialize the state
const initialState: UserState = {
  name: null,
  email: null,
  userId: null, // Initialize userId to null
  userType: null,
  isLoggedIn: false,
  isAuthenticated: false, // Start as not authenticated
  professional: null, // Default professional to null
  profileImage: null, // Initialize profile image to null
};

// Create the user slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        userId: string; // Add userId to the payload
        userType: 'client' | 'professional' | 'student';
        professional?: Professional | null; // Optional professional details
        profileImage?: string | null; // Include profile image
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userId = action.payload.userId; // Store userId
      state.userType = action.payload.userType;
      state.isLoggedIn = true; // User is logged in
      state.isAuthenticated = true; // User is authenticated
      state.professional = action.payload.professional || null; // Store professional info
      state.profileImage = action.payload.profileImage || null; // Store profile image URL
    },
    logout: (state) => {
      state.name = null; // Clear name on logout
      state.email = null; // Clear email on logout
      state.userId = null; // Clear userId on logout
      state.userType = null; // Clear user type on logout
      state.isLoggedIn = false; // Set logged in status to false
      state.isAuthenticated = false; // Set authentication status to false
      state.professional = null; // Clear professional details
      state.profileImage = null; // Clear profile image on logout
    },
    updateUserProfile(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
  },
});

// Selector to get user data from the state
export const selectUser = (state: RootState) => state.user; // Adjust the state path as needed

export const { login, logout, updateUserProfile } = userSlice.actions;

export default userSlice.reducer;
