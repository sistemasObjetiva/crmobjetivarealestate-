import React from 'react';
import '../styles/buttonGoogle.css'; // Enlaza al archivo CSS del botón de Google
import googleGLogo from '../assets/logos/logoGoogle.png'; // El ícono solo con la "G"

const GoogleButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="google-button">
      <img src={googleGLogo} alt="Google G Logo" /> 
    </button>
  );
};

export default GoogleButton;
