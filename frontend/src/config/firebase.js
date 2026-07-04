// Firebase Core
import { initializeApp } from "firebase/app";

// Firebase Services
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCm1K7V6JSeYYsghcbz70BG1OXLr9MkM_s",
  authDomain: "lumina-os-bc923.firebaseapp.com",
  projectId: "lumina-os-bc923",
  storageBucket: "lumina-os-bc923.firebasestorage.app",
  messagingSenderId: "266965521255",
  appId: "1:266965521255:web:50b20ffb4e2808fb3515c2",
  measurementId: "G-4G08Q8FZHG"
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