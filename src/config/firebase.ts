import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCGKpzJbyEJQghTovnoKQYJgXnlof8dVsk",
  authDomain: "wowchat-92053.firebaseapp.com",
  projectId: "wowchat-92053",
  storageBucket: "wowchat-92053.appspot.com",
  messagingSenderId: "972383148982",
  appId: "1:972383148982:web:e16826fbaed4465247bf17",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
