import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCUSBU0mdOyg1VoUR1Rb-KrdRS36jbVVLs",
  authDomain: "h3m-studio-b17e2.firebaseapp.com",
  projectId: "h3m-studio-b17e2",
  storageBucket: "h3m-studio-b17e2.firebasestorage.app",
  messagingSenderId: "141985006123",
  appId: "1:141985006123:web:5410f868653a1f9bd5606e",
  measurementId: "G-8CJE7EHZQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;