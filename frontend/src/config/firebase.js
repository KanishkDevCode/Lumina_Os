// Firebase Core
import { initializeApp } from "firebase/app";

// Firebase Services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB66caBKeaG1FDoNxM9KaU8E-Gb-OXHN70",
  authDomain: "lumina-os-bb8c5.firebaseapp.com",
  projectId: "lumina-os-bb8c5",
  storageBucket: "lumina-os-bb8c5.firebasestorage.app",
  messagingSenderId: "623832831503",
  appId: "1:623832831503:web:4cc9c8d6f81179baf1f57a",
  measurementId: "G-JZTZZ84JZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Analytics
const analytics = getAnalytics(app);

// EXPORT SERVICES
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;