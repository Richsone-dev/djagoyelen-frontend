import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Dettes from './pages/Dettes';
import Rapports from './pages/Rapports';
import Facture from './pages/Facture';
import Profil from './pages/Profil';
import Clients from './pages/Clients';
import Parametres from './pages/Parametres';
import Apropos from './pages/Apropos';
import Notifications from './pages/Notifications';
import Login from './Auth/Login';
import Register from './Auth/Register';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* --- ROUTES PROTÉGÉES --- */}
        <Route 
          path="/" 
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="dettes" element={<Dettes />} />
          <Route path="rapports" element={<Rapports />} />
          <Route path="factures" element={<Facture />} />
          <Route path="profil" element={<Profil />} />
          <Route path="clients" element={<Clients />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="apropos" element={<Apropos />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* --- 404 --- */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;