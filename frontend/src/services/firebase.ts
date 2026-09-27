import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import type { Place } from '../types';

// La configuración web de Firebase es pública por diseño; la seguridad la dan las reglas del proyecto.
const firebaseConfig = {
  apiKey: 'AIzaSyCLp33MZFW0TrYwP9nqFB9ziNwAD6m4mHc',
  authDomain: 'climax-tfg.firebaseapp.com',
  projectId: 'climax-tfg',
  storageBucket: 'climax-tfg.firebasestorage.app',
  messagingSenderId: '328786696268',
  appId: '1:328786696268:web:7fdd638b38629ae7d5bce9',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
}

export const onAuthStateChange = (callback: (user: UserProfile | null) => void) =>
  onAuthStateChanged(auth, (u) => callback(u ? { uid: u.uid, email: u.email, name: u.displayName } : null));

export const loginUser = async (email: string, password: string) => {
  await setPersistence(auth, browserLocalPersistence);
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (name: string, email: string, password: string) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  await setDoc(doc(db, 'users', credential.user.uid), { name: name.trim() }, { merge: true }).catch(() => {});
  return credential;
};

export const logoutUser = () => signOut(auth);

/** Favoritos sincronizados en Firestore. Si las reglas no lo permiten, la app sigue con localStorage. */
export const loadFavorites = async (uid: string): Promise<Place[] | null> => {
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return (snapshot.data()?.favorites as Place[] | undefined) ?? null;
  } catch {
    return null;
  }
};

export const saveFavorites = async (uid: string, favorites: Place[]) => {
  try {
    await setDoc(doc(db, 'users', uid), { favorites }, { merge: true });
  } catch {
    /* sin permisos en Firestore: los favoritos quedan en local */
  }
};

export const authErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Prueba de nuevo en unos minutos.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu red.';
    default:
      return 'No se pudo completar la operación.';
  }
};
