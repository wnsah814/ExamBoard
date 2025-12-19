import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5bHCJ0glHfTUxVwp1PEhMpwnGDyW24Rs",
  authDomain: "examboard-aebd3.firebaseapp.com",
  projectId: "examboard-aebd3",
  storageBucket: "examboard-aebd3.firebasestorage.app",
  messagingSenderId: "818607802858",
  appId: "1:818607802858:web:88caab34dd53ecbb494a93",
  measurementId: "G-X1GT0W2HT2",
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };
