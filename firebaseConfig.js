// Import the required functions from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Optional: Import getAnalytics only if you're using analytics
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrjvw6-rfs9BPsdD30kAjIQ-m2mQejKyo",
  authDomain: "medplus-supat-af28f.firebaseapp.com",
  projectId: "medplus-supat-af28f",
  storageBucket: "medplus-supat-af28f.appspot.com",
  messagingSenderId: "399287117531",
  appId: "1:399287117531:web:6a3cb397b9933e9cd78efe",
  measurementId: "G-D0187ZL711"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Optional: Initialize analytics if needed
// const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app); // Firebase Authentication instance
const db = getFirestore(app); // Firestore instance

// Export the initialized Firebase services
export { auth, db };
