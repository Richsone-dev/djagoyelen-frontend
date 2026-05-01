import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets&Objectifs';
import Dettes from './pages/Dettes';
import Rapports from './pages/Rapports';
import Facture from './pages/Facture';
import Profil from './pages/Profil';
import Clients from './pages/Clients';
import Parametres from './pages/Parametres';
import Apropos from './pages/Apropos';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard'; // Nouvelle page pour les admins
import Login from './Auth/Login';
import Register from './Auth/Register';


function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  // Supposons que vous stockiez le rôle dans le localStorage lors du login
  const userRole = localStorage.getItem('role'); 

  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        {/* --- ROUTES PROTÉGÉES AVEC LAYOUT --- */}
        <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/dettes" element={<Dettes />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/factures" element={<Facture />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/apropos" element={<Apropos />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* --- ROUTE ADMIN INTÉGRÉE --- */}
          <Route path="/admin" element={
            userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;