import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyA2pESBAAREmftG0Kv-U2MmsjdAQb8KI",
  authDomain: "process-effectiveness-tool.firebaseapp.com",
  projectId: "process-effectiveness-tool",
  storageBucket: "process-effectiveness-tool.firebasestorage.app",
  messagingSenderId: "58879461684",
  appId: "1:58879461684:web:a320046f993e24c14afd61"
};
// Main App instance
const app = initializeApp(firebaseConfig);
// Secondary App instance (used to create users without logging YOU out)
const secondaryApp = initializeApp(firebaseConfig, "Secondary");

export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp); // This line fixes your error
export const db = getFirestore(app);