import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA-suefx09kNyJhMlSnMmKp0lM9Mv6LzbU",
  authDomain: "clinic-management-db812.firebaseapp.com",
  projectId: "clinic-management-db812",
  storageBucket: "clinic-management-db812.firebasestorage.app",
  messagingSenderId: "258488422715",
  appId: "1:258488422715:web:e6438c85ea22b9ded1671e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 