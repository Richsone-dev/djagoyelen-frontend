function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  // Supposons que vous stockiez le rôle dans le localStorage lors du login
  const userRole = localStorage.getItem('role'); 

  return (
    <Router>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

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

        {/* --- REDIRECTIONS --- */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}