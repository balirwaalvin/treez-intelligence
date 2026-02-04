// Firebase Configuration and Initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRetXVRyqNerPgAJ9yYkEUrXpTuh8t0aQ",
  authDomain: "treez-intelligence.firebaseapp.com",
  projectId: "treez-intelligence",
  storageBucket: "treez-intelligence.firebasestorage.app",
  messagingSenderId: "456969015230",
  appId: "1:456969015230:web:573217cd67d3c5814933ef",
  measurementId: "G-T1CH4KY1MZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export Firebase services
export {
  app,
  analytics,
  auth,
  db,
  storage,
  googleProvider,
  // Auth functions
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  // Firestore functions
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
