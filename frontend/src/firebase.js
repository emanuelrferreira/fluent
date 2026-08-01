import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVkSUOdl5YAv4r6KUU1_owrsuFRpe7zA0",
  authDomain: "fluent-a19c0.firebaseapp.com",
  projectId: "fluent-a19c0",
  storageBucket: "fluent-a19c0.firebasestorage.app",
  messagingSenderId: "860405067787",
  appId: "1:860405067787:web:4e84d1475ad9abf86b570e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
