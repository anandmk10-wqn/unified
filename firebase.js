// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// TODO: Add your web app's Firebase configuration
// IMPORTANT: Replace this with your actual configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAjvOVA1kLK6Iyr9QV6buhWiFZNYyhaVeU",
  authDomain: "unifiedneeds.firebaseapp.com",
  projectId: "unifiedneeds",
  storageBucket: "unifiedneeds.firebasestorage.app",
  messagingSenderId: "359788439920",
  appId: "1:359788439920:web:298a53a6a4bc87a0d907b5",
  measurementId: "G-R3WF3TB6JZ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
