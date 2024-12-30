import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, Tab, Box, Modal, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer ,Cell,LabelList} from 'react-chartjs-2';
import { doc, getDoc, collection, query, where, getDocs,addDoc,setDoc } from 'firebase/firestore';
import {onAuthStateChanged, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, createUserWithEmailAndPassword, linkWithCredential, EmailAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';

import { db, auth,storage } from '../config/firebaseConfig';
import iconoRH from '../assets/icons/iconoRH.jpg';
import iconUsuario from '../assets/icons/iconUsuarioBco.png';
import iconEmpresaUsuarios from '../assets/icons/iconEmpresaUsuariosBco.png';




import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';






import logoObjetivaRealEstate from '../assets/logos/logoObjetivaRealEstate.png';
import logoObjetiva from '../assets/logos/logoObjetiva.png';



import '../styles/modal.css';
import '../styles/global.css';
import '../styles/directorioPage.css';


import icon from '../assets/icons/iconoPresupuesto.png';
import AddIcon from '@mui/icons-material/Add';













const BasePage = () => {
  const title = 'Usuarios';
 
  const [selectedView, setSelectedView] = useState(0);
  const handleViewChange = (event, newValue) => {
    setSelectedView(newValue);
  };


  const [timelineData, setTimelineData] = useState({
    startDate: null,
    endDate: null,
    todayPosition: null,
  });




  const today = new Date();  
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const docRef = doc(db, 'informacionGeneral', '4Fcyuy5tmdEPOl1c0fhN');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const startDate = data.fechaInicio.toDate();
          const endDate = data.fechaFinProyecto.toDate();
          const todayPosition = ((today - startDate) / (endDate - startDate)) * 100;




          setTimelineData({
            startDate,
            endDate,
            todayPosition: todayPosition >= 0 && todayPosition <= 100 ? todayPosition : null,
          });
        }
      } catch (error) {
        console.error('Error obteniendo los datos del proyecto o eventos:', error);
      }
    };
    fetchTimelineData();
  }, [today]);


  const [currentUserRole, setCurrentUserRole] = useState(null);
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
  useEffect(() => {
    const gestionarElementosGerente = () => {
      if (currentUserRole !== "gerente") {
        const botonesGerente = document.querySelectorAll('.btnGerente');
        botonesGerente.forEach(boton => {
          boton.disabled = true;
          boton.style.opacity = 0.5;
          boton.style.cursor = 'not-allowed';
        });
        const elementosRndGerente = document.querySelectorAll('.rndGerente');
        elementosRndGerente.forEach(elemento => {
          elemento.style.display = 'none';
        });
      }
    };
    gestionarElementosGerente();
  }, [currentUserRole]);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="main-container-flex">
      <div className="header-container">
        <Link to="/index">
          <div className="hidalma-logo-container">
            <img src={logoObjetivaRealEstate} alt="Logo" className="logo-hidalma" />
          </div>
        </Link>
        <div className="pageTitle-container">
          <div className="page-title-container">
            <img src={icon} alt={`${title} Icon`} className="page-icon" />
            <h1 className="page-title">{title}</h1>
          </div>
        </div>
        
      </div>




      {/* Contenido dinámico de la página */}
      <div className="mainContent">
      <div className="tabSelector-container-fixed">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedView} onChange={handleViewChange} variant="scrollable" scrollButtons="auto" aria-label="Scrollable tabs for navigation">
              <Tab label="Usuarios" />
            </Tabs>
          </Box>
        </div>
        {selectedView === 0 && (
        <div>
        </div>
        )}
        {selectedView === 1 && (<div>Contenido de Contratistas</div>)}
      </div>
      <div className="footer-container">
        <img src={logoObjetiva} alt="Logo Objetiva" className="logo" />
      </div>






      {currentUserRole && (
        <>
         
        </>
      )}






































    </div>
  );
};




export default BasePage;





