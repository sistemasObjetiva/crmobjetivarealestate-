import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPage';
import IndexPage from './pages/indexPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/index" element={<IndexPage />} /> {/* Página principal después del login */}
   
      </Routes>
    </Router>
  );
}

export default App;
