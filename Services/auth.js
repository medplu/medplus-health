import { auth, db } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithRedirect
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Sign up user
export const signUp = async (email, password, accountType, additionalData = {}) => {
  try {
    // Create a new user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Define the user data to store in Firestore
    const userData = {
      email: user.email,
      accountType: accountType || null,
      ...additionalData,
    };

    // Save user data in Firestore under the 'users' collection
    await setDoc(doc(db, "users", user.uid), userData);

    // Retrieve the newly created user's document to verify
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      console.log("User data:", userDoc.data());
    } else {
      console.error("No such document!");
    }
  } catch (error) {
    console.error("Error signing up: ", error.message);
    throw error; // Throw the error to handle it in the UI (if needed)
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    // Use signInWithRedirect for both web and mobile
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Google sign-in error: ", error.message);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Sign-in successful");
  } catch (error) {
    console.error("Error signing in: ", error.message);
    throw error;
  }
};

// Log out user
export const logOut = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error signing out: ", error.message);
    throw error;
  }
};