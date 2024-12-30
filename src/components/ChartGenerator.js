import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


import '../styles/global.css';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const ChartGenerator = ({ type, data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      datalabels: {
        display: true,
        align: 'top',
        formatter: Math.round,
        font: {
          weight: 'bold',
        },
      },
    },
    scales: {
      x: {
        display: false, // Ocultar eje X
      },
      y: {
        display: false, // Ocultar eje Y
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: data.label,
        data: data.values,
        backgroundColor: data.backgroundColor,
      },
    ],
  };

  if (type === 'barVertical') {
    return <Bar data={chartData} options={options} />;
  }

  return null;
};

export default ChartGenerator;
