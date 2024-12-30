// BasePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import logoHidalma from '../assets/logos/logoHidalma.gif';
import logoObjetiva from '../assets/logos/logoObjetiva.png';
import logoEntrepiso from '../assets/logos/logoEntrepiso.jpg';
import '../styles/modal.css';
import '../styles/global.css';

const BasePage = ({ title, children, icon }) => {
  return (
    <div className="main-container">
      <div className="header-container">
        <Link to="/index">
          <div className="hidalma-logo-container">
            <img src={logoHidalma} alt="Logo Hidalma" className="logo-hidalma" />
            <h2 className="hidalma-text">HIDALMA</h2>
          </div>
        </Link>
        </div>
        <div className="pageTitle-container">
        <div className="page-title-container">
          <img src={icon} alt={`${title} Icon`} className="page-icon" />
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      {/* Contenido dinámico de la página */}
      <div className="content-container">
        {children}
      </div>
      <div className="container-logos">
        <img src={logoEntrepiso} alt="Logo Entrepiso" className="logo" />
        <img src={logoObjetiva} alt="Logo Objetiva" className="logo" />
      </div>
    </div>
  );
};

export default BasePage;
