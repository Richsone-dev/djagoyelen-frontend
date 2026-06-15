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
import Category from './pages/Category';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import Public from './PublicPages/Public';

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
        {/* --- ROUTE D'ACCUEIL PUBLIQUE ENTRÉE DE L'APPLI --- */}
        {/* Accessible par tout le monde à l'adresse racine du site */}
        <Route path="/" element={<Public />} />

        {/* --- AUTHENTIFICATION --- */}
        {/* Si connecté, interdiction d'aller sur login/register -> redirection vers dashboard */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />


        {/* --- ESPACE ADMINISTRATION --- */}
        <Route
          path="/admin/login"
          element={
            localStorage.getItem('admin_token') ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          }
        />
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
          </Route>
        </Route>

        {/* --- ROUTES PROTÉGÉES (Espace Privé) --- */}
        {/* Si l'utilisateur n'est pas connecté, toute tentative d'accès à ces sous-routes le renvoie au /login */}
        <Route 
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/apropos" element={<Apropos />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/factures" element={<Facture />} />
          <Route path="/category" element={<Category />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* <Route path="/dettes" element={<Dettes />} /> */}
        </Route>

        {/* --- GESTION DES ERREURS 404 / REDIRECTIONS --- */}
        {/* Si la route n'existe pas : redirection vers l'accueil public s'il est déconnecté, ou vers le dashboard s'il est connecté */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;