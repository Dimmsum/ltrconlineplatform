// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBaZ71BMRrUIV2_tvQaiv8JcKHXdd8XNJA",
    authDomain: "ltrconlineplatform.firebaseapp.com",
    projectId: "ltrconlineplatform",
    storageBucket: "ltrconlineplatform.firebasestorage.app",
    messagingSenderId: "387938008267",
    appId: "1:387938008267:web:ede5d90617cf612a3e2f4e",
    measurementId: "G-E9ZFRQ50KL"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };