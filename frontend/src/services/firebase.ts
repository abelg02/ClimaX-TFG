import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from "firebase/auth";
import type { User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCLp33MZFW0TrYwP9nqFB9ziNwAD6m4mHc",
    authDomain: "climax-tfg.firebaseapp.com",
    projectId: "climax-tfg",
    storageBucket: "climax-tfg.firebasestorage.app",
    messagingSenderId: "328786696268",
    appId: "1:328786696268:web:7fdd638b38629ae7d5bce9",
    measurementId: "G-PBHQ9BW98J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const auth = getAuth(app);

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const saveUserData = async (userId: string, name: string) => {
  await setDoc(doc(db, "users", userId), {
    name: name
  });
};