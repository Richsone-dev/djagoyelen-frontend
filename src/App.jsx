import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Auth/Login';
import Register from './Auth/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets&Objectifs';
import Dettes from './pages/Dettes';
import Rapports from './pages/Rapports';
import Facture from './pages/Facture';
import Profil from './pages/Profil';
import Clients from './pages/Clients';
import MainLayout from './components/Mainlayout';
import Parametres from './pages/Parametres';
import Apropos from './pages/Apropos';
import Notifications from './pages/Notifications';
import Aide from './pages/Aide';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* --- ROUTES PROTÉGÉES AVEC LAYOUT --- */}
        <Route
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          {/*<Route path="/dettes" element={<Dettes />} />*/}
          <Route path="/rapports" element={<Rapports />} />
          {/*<Route path="/factures" element={<Facture />} />*/}
          <Route path="/profil" element={<Profil />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/parametres" element={<Parametres />} />
          <Route path="/apropos" element={<Apropos />} />
          {/*<Route path="/notifications" element={<Notifications />} />*/}
          {/*<Route path="/aide" element={<Aide />} />*/}
        </Route>

        {/* --- REDIRECTIONS --- */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;