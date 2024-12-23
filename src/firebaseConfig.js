// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "",
  authDomain: "modeloobjetivap1.firebaseapp.com",
  projectId: "modeloobjetivap1",
  storageBucket: "modeloobjetivap1.appspot.com",
  messagingSenderId: "727947564941",
  appId: "1:727947564941:web:3defa943950534aeef8fc4",
  measurementId: "G-8HFH3H1S7L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);