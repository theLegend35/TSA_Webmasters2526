// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8M0N3lV_YHLMj8GtHgcbwdPytPcCnpik",
  authDomain: "cypressconnect-41865.firebaseapp.com",
  projectId: "cypressconnect-41865",
  storageBucket: "cypressconnect-41865.firebasestorage.app",
  messagingSenderId: "285859097066",
  appId: "1:285859097066:web:4201879f4ef3567961ea93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);