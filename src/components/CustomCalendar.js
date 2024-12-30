import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BasePage from '../components/plantillaPage';
import ChartGenerator from '../components/ChartGenerator';
import Modal from 'react-modal';

import '../styles/diarioPage.css';
import '../styles/customCalendar.css';
import '../styles/global.css';
import '../styles/modal.css';
import iconoAdd from '../assets/icons/iconoAdd.png'; // Importa la imagen
// Asegura que el modal se asocia correctamente con el root de tu aplicación
Modal.setAppElement('#root');

// Función para calcular si un día ya ha pasado, es hoy, o es futuro
const getDayClass = (day, today, startDate, endDate) => {
  if (day.toDateString() === startDate.toDateString()) {
    return 'start-day';  // Día de inicio del proyecto
  } else if (day.toDateString() === endDate.toDateString()) {
    return 'end-day';  // Día de fin del proyecto
  } else if (day.toDateString() === today.toDateString()) {
    return 'current-day';  // Día actual
  } else if (day < today) {
    return 'past-day';  // Días pasados
  } else {
    return 'future-day';  // Días futuros
  }
};

const DiarioPage = () => {
  const [timelineData, setTimelineData] = useState({
    startDate: null,
    endDate: null,
    events: [],
    todayPosition: null,
  });

  const [selectedDay, setSelectedDay] = useState(null); // Estado para el día seleccionado
  const [modalIsOpen, setModalIsOpen] = useState(false); // Estado para manejar el modal

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const docRef = doc(db, 'informacionGeneral', '4Fcyuy5tmdEPOl1c0fhN');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const startDate = data.fechaInicio.toDate();
          const endDate = data.fechaFinProyecto.toDate();
          const today = new Date();

          const todayPosition = ((today - startDate) / (endDate - startDate)) * 100;

          setTimelineData({
            startDate,
            endDate,
            events: [
              { date: startDate, type: 'start' },
              { date: endDate, type: 'end' },
            ],
            todayPosition: todayPosition >= 0 && todayPosition <= 100 ? todayPosition : null,
          });
        }
      } catch (error) {
        console.error('Error fetching project dates:', error);
      }
    };

    fetchTimelineData();
  }, []);

  const exampleData = [
    {
      label: 'Estructura',
      avanceProgramado: 15,
      avanceReal: 13,
      backgroundColor: ['var(--secondary-color)', 'var(--yellow-color)'],
      event: 'En tiempo',
    },
    {
      label: 'Excavacion',
      avanceProgramado: 15,
      avanceReal: 13,
      backgroundColor: ['var(--purple-color)', 'var(--secondary-color)'],
      event: 'En proceso',
    },
    {
      label: 'Albañileria',
      avanceProgramado: 15,
      avanceReal: 13,
      backgroundColor: ['var(--red-color)', 'var(--secondary-color)'],
      event: 'Retrasada',
    },
  ];

  const transformedData = exampleData.map((item) => ({
    label: `${item.label} Programado vs Real`,
    labels: ['Avance'],
    values: [item.avanceProgramado, item.avanceReal],
    backgroundColor: item.backgroundColor,
  }));

  const today = new Date();

  // Función para generar el rango de meses entre dos fechas
  const generateMonths = (startDate, endDate) => {
    const months = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  // Función para manejar el clic en un día
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setModalIsOpen(true); // Abre el modal
  };

  // Cierra el modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Función para contar eventos
  const countEventsByType = (events, type) => {
    return events.filter(event => event.event === type).length;
  };

  return (
    <BasePage title="Reporte Diario">
      {/* Modal para mostrar los eventos del día */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Eventos del Día"
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
        >
        {/* Botón de cerrar en la esquina superior derecha */}
        <div className="close-button-content">
            <button className="close-button" onClick={closeModal}>×</button>
        </div>
        
        <h2>Eventos del día {selectedDay?.toLocaleDateString()}</h2>
        <div className="event-add-button">
            <img src={iconoAdd} alt="Agregar" />
        </div>
        <ul>
            <li>Evento 1 del día</li>
            <li>Evento 2 del día</li>
        </ul>
        </Modal>
  
      {/* Línea del Tiempo */}
      <div className="timeline-container">
        <div className="timeline">
          {timelineData.events.map((event, index) => (
            <div
              key={index}
              className={`timeline-item ${event.type}`}
              style={{
                left: `${((event.date - timelineData.startDate) / (timelineData.endDate - timelineData.startDate)) * 100}%`,
              }}
            ></div>
          ))}
          {timelineData.todayPosition && (
            <div
              className="timeline-today"
              style={{
                left: `${timelineData.todayPosition}%`,
              }}
            ></div>
          )}
          <div className="timeline-label start-label" style={{ left: `0%` }}>
            {timelineData.startDate && timelineData.startDate.toLocaleDateString()}
          </div>
          <div className="timeline-label end-label" style={{ left: `100%` }}>
            {timelineData.endDate && timelineData.endDate.toLocaleDateString()}
          </div>
        </div>
      </div>
  
      {/* Contenedor de gráficos */}
      <div className="charts-container">
        {transformedData.map((data, index) => (
          <div className="chart" key={index}>
            <ChartGenerator type="barVertical" data={data} />
          </div>
        ))}
      </div>
  
      {/* Generación de calendarios dinámicos */}
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
                  {[...Array(daysInMonth)].map((_, dayIndex) => {
                    const day = new Date(month.getFullYear(), month.getMonth(), dayIndex + 1);
                    const dayClass = getDayClass(day, today, timelineData.startDate, timelineData.endDate);
                    return (
                      <div
                        key={dayIndex}
                        className={`calendar-day ${dayClass}`}
                        onClick={() => handleDayClick(day)} // Maneja el clic en el día
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </BasePage>
  );
};

export default DiarioPage;

