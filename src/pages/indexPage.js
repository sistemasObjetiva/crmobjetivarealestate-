import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebaseConfig';

import '../styles/indexPage.css';
import '../styles/global.css';

// Importar iconos y logotipos
import fondoEdificio from '../assets/logos/logoObjetivaRealEstate.png';
import logoObjetiva from '../assets/logos/logoObjetiva.png';

import iconoMuestra from '../assets/icons/iconoMuestra.png';
import iconoRH from '../assets/icons/iconoRH.jpg';
import iconoDireccion from '../assets/icons/iconoDireccion.jpg';
import iconoClientes from '../assets/icons/iconoClientes.png';

const buttons = [
  { name: 'Resumen', icon: iconoMuestra },
  { name: 'Usuarios', icon: iconoRH },
  { name: 'Inmuebles', icon: iconoDireccion },
  { name: 'Clientes', icon: iconoClientes },
  { name: 'Seguimientos', icon: iconoMuestra },
];

const IndexPage = () => {
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [areasAcceso, setAreasAcceso] = useState([]);

  useEffect(() => {
    const fetchUserRole = async (userEmail) => {
      try {
        if (!userEmail) return;
        const usuariosRef = collection(db, "crmobjetivarealestate/crmobjetivarealestate/users");
        const q = query(usuariosRef, where("correoElectronico", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setCurrentUserRole(userData.rol);
          setAreasAcceso(userData.areasAcceso || []);
        } else {
          console.error("No se encontró el usuario en Firestore con el correo:", userEmail);
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRole(user.email);
      } else {
        console.log("Usuario no autenticado");
      }
    });
  }, []);

  const renderButtons = () => {
    if (currentUserRole === 'Gerente') {
      // Mostrar todos los botones si el usuario es gerente
      return buttons;
    } else {
      // Filtrar botones que coincidan con las áreas de acceso del usuario
      return buttons.filter(button => areasAcceso.includes(button.name));
    }
  };

  return (
    <div className="index-container">
      <div className="container-logo-central">
        <img src={fondoEdificio} alt="Fondo" className="fondo-imagen" />
      </div>
      
      
      <div className="container-iconos">
        <div className="iconos-grid">
          {renderButtons().map((button, index) => (
            <div
              key={index}
              className={`icono ${button.icon === iconoMuestra ? 'disabled' : ''}`}
              onClick={() => {
                if (button.name === 'Usuarios') navigate('/directorio');
                if (button.name === 'Inmuebles') navigate('/inmuebles');
                if (button.name === 'Clientes') navigate('/clientes');
              }}
            >
              <img src={button.icon} alt={`${button.name} icon`} className="icono-imagen" />
              <p>{button.name}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="footer-container">
        <img src={logoObjetiva} alt="Logo Objetiva" className="logo" />
      </div>
    </div>
  );
};

export default IndexPage;
