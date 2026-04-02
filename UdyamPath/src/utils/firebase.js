import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Helpers
export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// Firestore Helpers
export const getUserDoc = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

export const syncUserState = async (uid, stateData) => {
  // We exclude the massive report object to save bytes if necessary, but for now we sync all essential data
  const payload = {
    user: stateData.user || null,
    idea: stateData.idea || '',
    language: stateData.language || 'en',
    moduleProgress: stateData.moduleProgress || {},
    lastActiveDate: stateData.lastActiveDate || new Date().toISOString(),
    streak: stateData.streak || 1,
  };
  
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    await setDoc(docRef, payload, { merge: true });
  } else {
    await updateDoc(docRef, payload);
  }
};
