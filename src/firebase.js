import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-HtCJLgEaYlqexky4BIZvAltsEzFtXAI",
  authDomain: "dwitara-f6fda.firebaseapp.com",
  projectId: "dwitara-f6fda",
  storageBucket: "dwitara-f6fda.firebasestorage.app",
  messagingSenderId: "978835377112",
  appId: "1:978835377112:web:ec23282aa86271422200ad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
