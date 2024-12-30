import React, { useState } from "react";
import Input from "../components/input";
import Button from "../components/button";
import GoogleButton from "../components/buttonGoogle";
import "../styles/loginPage.css";
import "../styles/global.css";

import { signInWithGoogle, signInWithEmailPassword } from "../config/firebaseConfig"; // Importa la función de Firebase
import { useNavigate } from "react-router-dom"; // Hook para la navegación

// Importa los logotipos
import logoObjetiva from "../assets/logos/logoObjetiva.png";
import logoObjetivaRealEstate from "../assets/logos/logoObjetivaRealEstate.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Inicializa el hook para la navegación

  const handleSignIn = async () => {
    if (!email.includes("@")) {
      alert("Por favor ingresa un email válido.");
      return;
    }

    try {
      const user = await signInWithEmailPassword(email, password);
      console.log("Usuario logueado:", user);
      navigate("/index"); // Si la autenticación es exitosa, navega a la página principal
    } catch (error) {
      console.error("Error al iniciar sesión con email y contraseña:", error);
      alert("Error al iniciar sesión. Revisa tu correo y contraseña.");
      // Refresca la página después de que el usuario haga clic en "OK"
      window.location.reload();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Usuario logueado:", user);
      navigate("/index"); // Si la autenticación es exitosa, navega a la página principal
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("Error al iniciar sesión con Google.");
      // Refresca la página después de que el usuario haga clic en "OK"
      window.location.reload();
    }
  };

  return (
    <div className="login-container">
      <img src={logoObjetivaRealEstate} alt="Logo Hidalma" className="login-logo" />
      <div className="hidalma-logo">HIDALMA</div>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button label="Sign In" onClick={handleSignIn} />
      <GoogleButton onClick={handleGoogleSignIn} />

      {error && <p className="error-message">{error}</p>}

      {/* Logos en el pie de página */}
      <div className="container-logos">
        <img src={logoObjetiva} alt="Logo Objetiva" className="logo" />
      </div>
    </div>
  );
};

export default LoginPage;
