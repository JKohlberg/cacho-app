// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCAs_BpTmOj4sGML3xnZxBW2Sg2hEj9qvY",
  authDomain: "cacho-companion-app.firebaseapp.com",
  projectId: "cacho-companion-app",
  storageBucket: "cacho-companion-app.firebasestorage.app",
  messagingSenderId: "158810080731",
  appId: "1:158810080731:web:4d3de513d264b7874253fe",
  measurementId: "G-8S00GGLL0B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app)