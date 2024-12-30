import React from 'react';
import '../styles/button.css'; // Asegúrate de que el path sea correcto

const Button = ({ label, onClick }) => {
  return (
    <button onClick={onClick} className="primary-button">
      {label}
    </button>
  );
};

export default Button;
