// Importa solo lo necesario desde el SDK modular
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAyJ5i_I1gGM5Mcf_0csMP0BoiVo7I6hUw",
  authDomain: "modeloobjetivap1.firebaseapp.com",
  databaseURL: "https://modeloobjetivap1-default-rtdb.firebaseio.com",
  projectId: "modeloobjetivap1",
  storageBucket: "modeloobjetivap1.appspot.com",
  messagingSenderId: "727947564941",
  appId: "1:727947564941:web:257991877003664bef8fc4",
  measurementId: "G-W0EHNF8QLG"
};
// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa servicios
const db = getFirestore(app);
const auth = getAuth(app);

// Función para iniciar sesión con Google
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// Función para iniciar sesión con email y contraseña
const signInWithEmailPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Exporta las funciones y servicios
export { db, auth, signInWithGoogle, signInWithEmailPassword };