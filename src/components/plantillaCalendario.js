import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Modal, Box, Typography, TextField, Table, TableHead, TableRow, TableCell, TableBody,Tab,Tabs, dialogClasses} from '@mui/material';
import { doc, getDoc, collection, query, where, getDocs,addDoc,updateDoc,setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth,storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/global.css';

import logoHidalma from '../assets/logos/logoHidalma.gif';
import logoObjetiva from '../assets/logos/logoObjetiva.png';
import logoEntrepiso from '../assets/logos/logoEntrepiso.jpg';

import icon from '../assets/icons/iconoRiesgos.jpg';

import iconoAdd from '../assets/icons/iconoAdd.png';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const BasePage = () => {
  const title = 'Riesgos';
  const [selectedView, setSelectedView] = useState(0);
  const handleViewChange = (event, newValue) => {
    setSelectedView(newValue);
  };

  
 







  const [currentUserRole, setCurrentUserRole] = useState(null);
  useEffect(() => {
    const fetchUserRole = async (userEmail) => {
      try {
        if (!userEmail) return;
        const usuariosRef = collection(db, "users");
        const q = query(usuariosRef, where("correoElectronico", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setCurrentUserRole(userData.tipoUsuario); 
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
  const isGerente = currentUserRole === 'Gerente'; // Verificación de si el usuario es Gerente
  useEffect(() => {
    const gestionarElementosGerente = () => {
      if (!isGerente) {
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
  }, [isGerente]);





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

  







  /////////////////////////////////////Calendario
const [dayColors, setDayColors] = useState({});
const [eventosPorDia, setEventosPorDia] = useState({});
const [eventCounters, setEventCounters] = useState({
    enTiempo: 0,
    enProceso: 0,
    retrasada: 0,
  });
  const [eventData, setEventData] = useState(null);
  // Estado para los datos de la gráfica de días del proyecto
  const [projectData, setProjectData] = useState(null);
  const fetchEventosRiesgos = async () => {
    try {
      const eventsRef = collection(db, 'eventReporteRiesgos');
      const eventSnapshot = await getDocs(eventsRef);
      let eventMap = {};
      let counters = { pendiente: 0, resuelta: 0 };

      eventSnapshot.forEach((doc) => {
        const eventData = doc.data();
        const eventId = doc.id; // Obtener el ID del documento
        const selectedDays = Object.keys(eventData); // Obtener todas las fechas (selectedDays)

        selectedDays.forEach((day) => {
          const modifications = eventData[day];

          // Obtener la última modificación
          const lastModification = getLastModification(modifications);
          lastModification.eventId = eventId; // Añadir el ID del evento
          lastModification.historial = getHistorial(modifications, lastModification.timestamp, true); // Incluir la primera modificación

          if (!eventMap[day]) {
            eventMap[day] = { eventos: [] };
          }

          eventMap[day].eventos.push(lastModification);

          // Actualizar los contadores según el tipo de semáforo
          if (lastModification.tipoSemaforo === 'Pendiente') {
            counters.pendiente += 1;
          } else if (lastModification.tipoSemaforo === 'Resuelta') {
            counters.resuelta += 1;
          }
        });
      });

      setEventosPorDia(eventMap); // Almacenar los eventos por día
      setEventCounters(counters); // Almacenar los contadores de eventos
      setEventData({
        labels: ['Pendiente', 'Resuelta'],
        datasets: [
          {
            label: 'Eventos',
            data: [counters.pendiente, counters.resuelta],
            backgroundColor: ['orange', 'green'],
          },
        ],
      });
    } catch (error) {
      console.error('Error obteniendo los eventos:', error);
    }
  };

  // Función para obtener la última modificación
  const getLastModification = (modificaciones) => {
    const sortedModifications = Object.entries(modificaciones)
      .sort(([timestampA], [timestampB]) => Number(timestampB) - Number(timestampA)); // Ordenar de mayor a menor

    const [lastTimestamp, lastData] = sortedModifications[0];
    lastData.timestamp = lastTimestamp; // Añadir el timestamp de la última modificación
    return lastData;
  };

  // Función para obtener el historial de modificaciones (incluyendo la primera)
  const getHistorial = (modificaciones, lastTimestamp, includeFirst = false) => {
    const historial = {};
    const sortedModifications = Object.entries(modificaciones)
      .sort(([timestampA], [timestampB]) => Number(timestampA) - Number(timestampB)); // Ordenar de menor a mayor

    sortedModifications.forEach(([timestamp, data], index) => {
      if (timestamp !== lastTimestamp || includeFirst) {
        historial[timestamp] = data;
      }
    });

    return historial;
  };
  useEffect(() => {
    
  
    fetchEventosRiesgos();
  }, []);
  
  
 
  


  const generateMonths = (startDate, endDate) => {
    const months = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };
  const generateMonthDays = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Días en el mes actual
    const startDayOfWeek = new Date(year, month, 1).getDay(); // Día de la semana en que empieza el mes (0 = domingo, 6 = sábado)
    const daysArray = [];

    // Añadir días vacíos al principio, hasta que comience el día 1
    for (let i = 0; i < startDayOfWeek; i++) {
      daysArray.push(null); // Día vacío
    }

    // Añadir los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(day);
    }

    // Llenar con días vacíos al final para completar la cuadrícula
    const remainingCells = 42 - daysArray.length; // 42 celdas para una cuadrícula de 7 días * 6 semanas
    for (let i = 0; i < remainingCells; i++) {
      daysArray.push(null);
    }

    return daysArray;
};

const getDayClass = (day, today, startDate, endDate, eventos, dayColors) => {
  let baseClass = '';

  if (day.toDateString() === startDate.toDateString()) {
    baseClass = 'start-day';
  } else if (day.toDateString() === endDate.toDateString()) {
    baseClass = 'end-day';
  } else if (day.toDateString() === today.toDateString()) {
    baseClass = 'current-day';
  } else if (day < today) {
    baseClass = 'past-day';
  } else {
    baseClass = 'future-day';
  }

  if (eventos && eventos.length > 0) {
    const lastEvent = eventos[eventos.length - 1]; // Obtener la última modificación
    
    if (lastEvent.tipoSemaforo === 'Pendiente') {
      return `${baseClass} Pendiente`;
    } else if (lastEvent.tipoSemaforo === 'Resuelta') {
      return `${baseClass} Resuelta`;
    }
  }

  const color = dayColors[day.toDateString()];
  if (color === 'Pendiente') {
    return `${baseClass} Pendiente`;
  } else if (color === 'Resuelta') {
    return `${baseClass} Resuelta`;
  }

  return baseClass;
};


const handleDayClick = (day) => {
  setSelectedDay(day.toDateString()); // Cambia el formato a cadena
  setIsEventosDiaModalOpen(true);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const [selectedDay, setSelectedDay] = useState(null);
const [isEventosDiaModalOpen, setIsEventosDiaModalOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const openEventosDiaModal = () => {
  setIsEventosDiaModalOpen(true);
};
const closeEventosDiaModal = () => {
    setIsEventosDiaModalOpen(false);
};

const getSemaforoColor = (tipoSemaforo) => {
  switch (tipoSemaforo) {
    case 'Pendiente':
      return 'orange';
    case 'Resuelta':
      return 'green';
    default:
      return 'grey';
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const [addEventModalIsOpen, setAddEventModalIsOpen] = useState(false);
const [newEvent, setNewEvent] = useState({
  titulo: '',  
  contratista : '',     // Inicializar el título como cadena vacía
  tipoSemaforo: 'Pendiente',  // Inicializar el semáforo como cadena vacía o con un valor predeterminado
  descripcion: '',   // Inicializar la descripción como cadena vacía
  imagenes: []  , // Inicializar las imágenes como un array vacío
});
const handleNewEventChange = (e) => {
  const { name, value } = e.target;

  // Actualiza el estado sin causar re-renderización infinita
  setNewEvent((prevEvent) => ({
    ...prevEvent,
    [name]: value,
  }));
};
const handleEventClick = (evento) => {
  setNewEvent({
    ...evento, // Incluir los datos del evento
    eventId: evento.eventId,
    imagenes: evento.imagenes,
  });
  setAddEventModalIsOpen(true);
};


const openAddEventModal = (newEvent) => {
  setAddEventModalIsOpen(true);
};

const closeAddEventModal = () => {
  resetEvent(); // Restablecer el estado del evento
  setAddEventModalIsOpen(false); // Cerrar el modal
};
  
const handleImageUpload = (e) => {
  const nuevasImagenes = Array.from(e.target.files);
  setNewEvent((prevEvent) => ({
    ...prevEvent,
    imagenes: [
      ...prevEvent.imagenes.filter((img) => typeof img === 'string'), // Mantener solo las URLs existentes
      ...nuevasImagenes, // Agregar nuevas imágenes seleccionadas
    ],
  }));
};

const saveNewEvent = async () => {
  try {
    const imagenesExistentes = newEvent.imagenes.filter((imagen) => typeof imagen === 'string');
    const imagenesNuevas = newEvent.imagenes.filter((imagen) => imagen instanceof File);

    // 2. Subir las imágenes nuevas a Firebase Storage
    const imagenesNuevasUrls = await Promise.all(
      imagenesNuevas.map(async (imagen) => {
        try {
          const uniqueImageName = `${Date.now()}-${imagen.name || 'image'}`; // Evitar 'undefined'
          const imageRef = ref(storage, `eventos/${uniqueImageName}`);
          await uploadBytes(imageRef, imagen); // Subir la imagen
          const downloadUrl = await getDownloadURL(imageRef); // Obtener la URL

          return downloadUrl; // Retornar la URL
        } catch (uploadError) {
          return null; // Manejo seguro del error
        }
      })
    );
    const imagenesNuevasFiltradas = imagenesNuevasUrls.filter((url) => url !== null);
    const imagenesFinales = [...imagenesExistentes, ...imagenesNuevasFiltradas];
    const eventId = newEvent.eventId || doc(collection(db, 'eventReporteRiesgos')).id;
    const eventRef = doc(db, 'eventReporteRiesgos', eventId);
    const docSnap = await getDoc(eventRef);

    const selectedDayKey = new Date(selectedDay).setHours(0, 0, 0, 0).toString();
    const modificationTimestamp = new Date().getTime().toString();

    const modificationData = {
      titulo: newEvent.titulo,
      contratista: newEvent.contratista,
      tipoSemaforo: newEvent.tipoSemaforo,
      descripcion: newEvent.descripcion,
      imagenes: imagenesFinales,
      fecha: new Date(), 
      fechaString: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }),
      
    };

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      if (existingData[selectedDayKey]) {
        existingData[selectedDayKey][modificationTimestamp] = modificationData;
      } else {
        existingData[selectedDayKey] = {
          [modificationTimestamp]: modificationData,
        };
      }
      await updateDoc(eventRef, {
        [selectedDayKey]: existingData[selectedDayKey]
      });
      console.log('Modificación agregada con éxito');
    } else {
      await setDoc(eventRef, {
        [selectedDayKey]: {
          [modificationTimestamp]: modificationData,
        },
      });
      console.log('Nuevo evento creado con éxito');
    }
    closeAddEventModal();
    await fetchEventosRiesgos();
  } catch (error) {
    console.error('Error guardando o actualizando el evento:', error);
  }
};
const resetEvent = () => {
  setNewEvent({
    titulo: '',
    tipoSemaforo: 'Pendiente',
    descripcion: '',
    imagenes: [],
    eventId: null,
  });
    
  
};



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const [selectedViewRepGal, setSelectedViewRepGal] = useState(0);

const handleTabChangeRepGal = (event, newValue) => {
  setSelectedViewRepGal(newValue);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
useEffect(() => {
  if (timelineData.startDate && timelineData.endDate) {
    const today = new Date();
    const daysTotal = Math.floor((timelineData.endDate - timelineData.startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((today - timelineData.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = daysTotal - daysElapsed;

    // Actualiza los datos de la gráfica de días del proyecto
    setProjectData({
      labels: ['Días calendario prog','Días transcurridos', 'Días para terminar', ],
      datasets: [
        {
          label: 'Días',
          data: [daysTotal,daysElapsed, daysRemaining ],
          backgroundColor: ['blue','green', 'blue'],
        },
      ],
    });
  }
}, [timelineData.startDate, timelineData.endDate]);
const eventChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Cambiar la orientación a horizontal
  plugins: {
    legend: {
      display: false, // Quitar la leyenda
    },
    title: {
      display: true,
      text: 'Eventos por Semáforo',
      position: 'top',
      font: {
        size: 14, // Tamaño del título
        weight: 'bold',
      },
    },
    datalabels: {
      anchor: 'end',
      align: 'end',
      formatter: (value) => value, // Mostrar el valor como está
      font: {
        size: 12,
        weight: 'bold',
      },
    },
  },
  scales: {
    x: {
      display: false, // Quitar el eje X
      beginAtZero: true, // Comenzar desde cero
      suggestedMax: eventData && eventData.datasets 
        ? Math.max(...eventData.datasets[0].data) + 1 
        : 10, // Agregar un margen superior al valor más alto
    },
    y: {
      display: true, // Mostrar el eje Y
    },
  },
  layout: {
    padding: 0,
  },
  barPercentage: 0.5, // Ajustar el tamaño de la barra para dejar más espacio
  categoryPercentage: 0.5,
};

const projectChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Cambiar la orientación a horizontal
  plugins: {
    legend: {
      display: false, // Quitar la leyenda
    },
    title: {
      display: true,
      text: 'Días del Proyecto',
      position: 'top',
      font: {
        size: 14, // Tamaño del título
        weight: 'bold',
      },
    },
    datalabels: {
      anchor: 'end',
      align: 'end',
      formatter: (value) => value, // Mostrar el valor como está
      font: {
        size: 12,
        weight: 'bold',
      },
    },
  },
  scales: {
    x: {
      display: false, // Quitar el eje X
      beginAtZero: true, // Comenzar desde cero
      suggestedMax: eventData && eventData.datasets 
        ? Math.max(...eventData.datasets[0].data) + 1 
        : 10, 
    },
    y: {
      display: true, // Mostrar el eje Y
    },
  },
  layout: {
    padding: 0,
  },
  barPercentage: 0.5, // Ajustar el tamaño de la barra para dejar más espacio
  categoryPercentage: 0.8,
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="main-container-flex">
      <div className="header-container">
        <Link to="/index">
          <div className="hidalma-logo-container">
            <img src={logoHidalma} alt="Logo Hidalma" className="logo-hidalma" />
            <h2 className="hidalma-text">HIDALMA</h2>
          </div>
        </Link>
        <div className="pageTitle-container">
          <div className="page-title-container">
            <img src={icon} alt={`${title} Icon`} className="page-icon" />
            <h1 className="page-title">{title}</h1>
          </div>
        </div>
        <div className="timeline-container-fixed">
          <div className="timeline">
            <div className="timeline-item start" style={{ left:` 0% `}}></div>
            {timelineData.todayPosition && <div className="timeline-today" style={{ left: `${timelineData.todayPosition}%` }}></div>}
            <div className="timeline-item end" style={{ left:` 100% `}}></div>
            <div className="timeline-label start-label" style={{ left: `0%` }}>
              {timelineData.startDate && timelineData.startDate.toLocaleDateString()}
            </div>
            <div className="timeline-label end-label" style={{ left: `100%` }}>
              {timelineData.endDate && timelineData.endDate.toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="tabSelector-container-fixed">
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedView} onChange={handleViewChange} variant="scrollable" scrollButtons="auto" aria-label="Scrollable tabs for navigation">
              <Tab label="Riesgos General" />
            </Tabs>
          </Box>
        </div>
      </div>

      {/* Contenido dinámico de la página */}
      <div className="mainContent">
      {selectedView === 0 && (
        <div>
            {/* {isGerente ? (
            <p>Contenido para el Gerente.</p>  // Contenido solo para el Gerente
            ) : (
            <p>Contenido para el Usuario.</p>  // Contenido solo para el Usuario
            )} */}
             <div className="graphs-row" style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
                {eventData && (
                  <div style={{ width: '45%', minWidth: '300px', height: '150px' }}>
                    <Bar data={eventData} options={eventChartOptions} />
                  </div>
                )}
                {projectData && (
                  <div style={{ width: '45%', minWidth: '300px', height: '150px' }}>
                    <Bar data={projectData} options={projectChartOptions} />
                  </div>
                )}
              </div>
            
            <div className="event-status-container">
                <div className="event-status">
                    <div className="status-indicator" style={{ backgroundColor: 'orange' }}></div>
                    Pendiente: {eventCounters.pendiente}
                </div>
                <div className="event-status">
                    <div className="status-indicator" style={{ backgroundColor: 'green' }}></div>
                    Resuelta: {eventCounters.resuelta}
                </div>
            </div>
            <div className="calendars-container">
                {timelineData.startDate &&
                timelineData.endDate &&
                generateMonths(timelineData.startDate, timelineData.endDate).map((month, index) => {
                    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

                    return (
                    <div className="calendar-card" key={index}>
                        <div className="calendar-header" style={{ backgroundColor: 'var(--primary-color)' }}>
                        <div className="month-year">
                            {month.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}
                        </div>
                        <div className="calendar-weekdays" style={{ backgroundColor: 'var(--context1-color)' }}>
                            <div className="weekday">S</div>
                            <div className="weekday">M</div>
                            <div className="weekday">T</div>
                            <div className="weekday">W</div>
                            <div className="weekday">T</div>
                            <div className="weekday">F</div>
                            <div className="weekday">S</div>
                        </div>
                        </div>
                        <div className="calendar-days">
                          {generateMonthDays(month.getMonth(), month.getFullYear()).map((day, dayIndex) => {
                            const dayDate = new Date(month.getFullYear(), month.getMonth(), day || 1); // Genera la fecha correcta
                            const dayTimestamp = dayDate.setHours(0, 0, 0, 0); // Convierte el día a timestamp sin horas para comparar correctamente
                            const dayClass = day
                              ? getDayClass(dayDate, today, timelineData.startDate, timelineData.endDate, eventosPorDia[dayTimestamp]?.eventos, dayColors)
                              : ''; // Si no es un día válido, no asigna clase
                            return (
                              <div key={dayIndex} className={`calendar-day ${dayClass}`} onClick={day ? () => handleDayClick(dayDate) : null}>
                                {day || ''} {/* Solo mostrar el número si hay un día válido */}
                              </div>
                            );
                          })}
                        </div>
                    </div>
                    );
                })}
            </div>
            <div>
            <div className="tabSelector-container">
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={selectedViewRepGal} 
                onChange={handleTabChangeRepGal} // Usar la función corregida aquí
                variant="scrollable" 
                scrollButtons="auto" 
                aria-label="Scrollable tabs for navigation"
              >
                <Tab label="Galería" />
                <Tab label="Reporte" />
              </Tabs>
            </Box>
          </div>

          {/* Contenido de las Tabs */}
          {selectedViewRepGal === 0 && (
            <div className="galeria-container">
              <h3>Galería</h3>
              {Object.values(eventosPorDia).some(dia => dia.eventos.some(evento => evento.imagenes && evento.imagenes.length > 0)) ? (
                Object.values(eventosPorDia).map((dia, diaIndex) => (
                  <div key={diaIndex} className="dia-container">
                    <div className="barra-fecha">
                      <span>{dia.eventos[0]?.fechaString}</span>
                    </div>
                    <div className="imagenes-grid">
                      {dia.eventos.map((evento, eventoIndex) => 
                        evento.imagenes.map((imagen, imagenIndex) => (
                          <div key={`${diaIndex}-${eventoIndex}-${imagenIndex}`} className="imagen-item">
                            <img src={imagen} alt={`Evento ${eventoIndex + 1}`} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No hay imágenes disponibles.</p>
              )}
            </div>
          )}

          {selectedViewRepGal === 1 && (
            <div className="reporte-container">
            <h3>Reporte de Modificaciones</h3>
            <table className="tabla-modificaciones">
              <thead>
                <tr>
                  <th>Semáforo</th>
                  <th>Fecha</th>
                  <th>Título</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(eventosPorDia).map((dia, diaIndex) =>
                  dia.eventos.map((evento, eventoIndex) => {
                    return Object.entries(evento.historial || {}).map(([timestamp, modificacion], modIndex) => {
                      return (
                        <tr key={`${diaIndex}-${eventoIndex}-${modIndex}`}>
                          <td>
                            <div
                              className={`cuadro-semaforo ${
                                modificacion.tipoSemaforo === 'Pendiente' ? 'pendiente' :
                                modificacion.tipoSemaforo === 'Resuelta' ? 'resuelta' : ''
                              }`}
                            ></div>
                          </td>
                          <td>{modificacion.fechaString || 'N/A'}</td>
                          <td>{modificacion.titulo || 'Título no disponible'}</td>
                          <td>{modificacion.descripcion || 'Descripción no disponible'}</td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
                 
            )}
          </div>
        </div>        
        )}
        {selectedView === 1 && (
          <div>
            <h2>Contenido de Tab 1</h2>
            {isGerente ? (
            <p>Contenido para el Gerente.</p>  // Contenido solo para el Gerente
            ) : (
            <p>Contenido para el Usuario.</p>  // Contenido solo para el Usuario
            )}
          </div>
        )}
      </div>
      <div className="footer-container">
        <img src={logoEntrepiso} alt="Logo Entrepiso" className="logo" />
        <img src={logoObjetiva} alt="Logo Objetiva" className="logo" />
      </div>
      {/* Modal Dia ////////////////////////////////////////////////////////////////// */}
      <Modal open={isEventosDiaModalOpen} onClose={closeEventosDiaModal}>
        <div 
          className="modal-container" 
          style={{ 
            width: '60%', 
            maxHeight: '400px',
            padding: '20px',
            overflowY: 'auto',
            maxWidth: '600px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2>Eventos del día {selectedDay}</h2>
            <button className="close-button" onClick={closeEventosDiaModal}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div className="event-add-button" style={{ marginBottom: '10px' }}>
              <img src={iconoAdd} alt="Agregar" onClick={() => openAddEventModal(newEvent)} />
            </div>
            <ul style={{ padding: '0', listStyle: 'none' }}>
              {eventosPorDia[new Date(selectedDay).getTime()]?.eventos?.length > 0 ? (
                eventosPorDia[new Date(selectedDay).getTime()].eventos.map((evento, index) => (
                  <li 
                    key={index} 
                    onClick={() => handleEventClick(evento)} 
                    style={{ cursor: 'pointer', marginBottom: '10px' }}
                  >
                    {evento.titulo} - <span style={{ color: getSemaforoColor(evento.tipoSemaforo) }}>{evento.tipoSemaforo}</span>
                  </li>
                ))
              ) : (
                <li>No hay eventos para este día.</li>
              )}
            </ul>
          </div>
        </div>
      </Modal>


 {/* Modal Eventos ////////////////////////////////////////////////////////////////// */}

      <Modal open={addEventModalIsOpen} onClose={closeAddEventModal}>
        <div 
          className="modal-container" 
          style={{ 
            width: '60%',  // Ajusta el ancho para que no sea tan grande
            maxHeight: '500px', // Ajuste automático de la altura
            padding: '20px',
            overflowY: 'auto',
            maxWidth: '600px', // Limita el ancho máximo
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <button className="close-button" onClick={closeAddEventModal}>×</button>
            <div>
              <h2>Agregar Evento</h2>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
              <label htmlFor="titulo" style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                Título
              </label>
              <input
                id="titulo"
                type="text"
                name="titulo"
                placeholder="Título del Evento"
                value={newEvent.titulo || ''}
                onChange={handleNewEventChange}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
              <label htmlFor="contratista" style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                Contratista
              </label>
              <input
                id="contratista"
                type="text"
                name="contratista"
                placeholder="Contratista Responsable"
                value={newEvent.contratista || ''}
                onChange={handleNewEventChange}
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div className="input-container">
              <label htmlFor="tipoSemaforo" style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                Semáforo
              </label>
              <select name="tipoSemaforo" value={newEvent.tipoSemaforo} onChange={handleNewEventChange}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Resuelta">Resuelta</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div className="input-container">
              <label htmlFor="descripcion" style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                Descripción
              </label>
              <input type="text" name="descripcion" value={newEvent.descripcion} onChange={handleNewEventChange} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div className="input-container">
              <label htmlFor="descripcion" style={{ marginBottom: '5px', fontWeight: 'bold' }}>
                Imágenes
              </label>
              <input type="file" multiple onChange={handleImageUpload} />
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Imágenes Cargadas:</label>
            <div>
              {newEvent.imagenes?.map((img, index) => (
                <img 
                  key={index} 
                  src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                  alt={`Imagen ${index}`} 
                  style={{ width: '150px', height: '150px', margin: '5px' }} 
                />
              ))}
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Typography variant="h6" gutterBottom>Historial de Modificaciones</Typography>
            {newEvent.historial && Object.keys(newEvent.historial).length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(newEvent.historial).map(([timestamp, modification], index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(parseInt(timestamp)).toLocaleString()}</TableCell>
                      <TableCell>{modification.descripcion}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No hay historial de modificaciones.</Typography>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '10px' }}>
            <div className="input-container">
              <button onClick={saveNewEvent}>Guardar Evento</button>
            </div>
          </div>
        </div>
      </Modal>



    </div>
  );
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default BasePage;
