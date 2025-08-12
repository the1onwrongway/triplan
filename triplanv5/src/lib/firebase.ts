
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "triplan-23p2u",
  "appId": "1:594660745306:web:58bc9dca4be11f2b7bb863",
  "storageBucket": "triplan-23p2u.firebasestorage.app",
  "apiKey": "AIzaSyCZUvWzZuug-KPJ5dNCdhRdNP8Mzpd4__k",
  "authDomain": "triplan-23p2u.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "594660745306"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
