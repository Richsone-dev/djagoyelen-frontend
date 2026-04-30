import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import logo from '../assets/djago-logo.jpeg';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        white: '#ffffff',
        successGreen: '#198754',
        accentPurple: '#6f42c1',
        primaryBlue: '#0d6efd'
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                });
        }
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            if (width > 768 && width <= 1024) setIsCollapsed(true);
            else if (width > 1024) setIsCollapsed(false);
            if (width > 768) setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Erreur déconnexion", error);
        } finally {
            localStorage.clear();
            navigate('/login', { replace: true });
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    const menuSections = [
        {
            title: "Menu Principal",
            links: [
                { path: 'dashboard', label: 'Tableau de bord', icon: 'speedometer2' },
                { path: 'transactions', label: 'Transactions', icon: 'cash-stack' },
                { path: 'budgets', label: 'Budgets', icon: 'piggy-bank' },
                { path: 'dettes', label: 'Dettes', icon: 'person-dash' },
                { path: 'rapports', label: 'Rapports', icon: 'file-earmark-bar-graph' },
                { path: 'factures', label: 'Factures', icon: 'receipt' },
                { path: 'clients', label: 'Clients', icon: 'people' },
                { path: 'profil', label: 'Profil', icon: 'person' },
                { path: 'parametres', label: 'Paramètres', icon: 'gear' },
                { path: 'apropos', label: 'À propos', icon: 'info-circle' },
                { path: 'notifications', label: 'Notifications', icon: 'bell' },
                { path: 'aide', label: 'Aide', icon: 'question-circle' },
            ]
        }
    ];

    const sidebarWidth = isMobile ? '0px' : (isCollapsed ? '70px' : '250px');
    const headerHeight = '72px';

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            
            {/* 1. SIDEBAR */}
            <nav 
                className="d-flex flex-column shadow" 
                style={{ 
                    width: isMobile ? (isSidebarOpen ? '250px' : '0') : sidebarWidth, 
                    backgroundColor: colors.darkGreen, 
                    color: 'white',
                    position: 'fixed',
                    left: isMobile && !isSidebarOpen ? '-250px' : '0',
                    top: 0,
                    height: '100vh',
                    zIndex: 1050,
                    transition: 'all 0.3s ease',
                    overflowY: 'auto'
                }}
            >
                <div className="d-flex justify-content-between align-items-center p-3">
                    <div className="d-flex align-items-center" onClick={() => !isMobile && setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                        {(!isCollapsed || isMobile) && <h4 className="fw-bold ms-2 mb-0" style={{ fontSize: '1.1rem' }}><span style={{ color: colors.successGreen }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span></h4>}
                    </div>
                </div>

                <div className="flex-grow-1 px-2">
                    {menuSections.map((section, idx) => (
                        <ul className="nav flex-column" key={idx}>
                            {section.links.map((link) => (
                                <li className="nav-item" key={link.path}>
                                    <Link to={`/${link.path}`} className={`nav-link text-white d-flex align-items-center p-3 ${location.pathname === `/${link.path}` ? 'bg-white bg-opacity-10' : ''}`} onClick={() => isMobile && setIsSidebarOpen(false)}>
                                        <i className={`bi bi-${link.icon} fs-5`}></i>
                                        {(!isCollapsed || isMobile) && <span className="ms-3">{link.label}</span>}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>

                <button onClick={handleLogout} className="btn text-white p-3 border-0">
                    <i className="bi bi-power fs-5"></i> {(!isCollapsed || isMobile) && <span className="ms-2">Déconnexion</span>}
                </button>
            </nav>

            {/* 3. CONTENU */}
            <div className="d-flex flex-column w-100" style={{ marginLeft: isMobile ? '0' : sidebarWidth, transition: '0.3s' }}>
                <header className="shadow-sm px-4 d-flex align-items-center" style={{ position: 'fixed', top: 0, right: 0, left: isMobile ? 0 : sidebarWidth, height: headerHeight, zIndex: 1000, backgroundColor: colors.darkGreen, transition: '0.3s' }}>
                    <button className="btn d-md-none me-3" style={{backgroundColor: colors.orange, color: 'white'}} onClick={() => setIsSidebarOpen(true)}>
                        <i className="bi bi-list"></i>
                    </button>
                    <h5 className="text-white fw-bold mb-0">{menuSections[0].links.find(l => `/${l.path}` === location.pathname)?.label || "Accueil"}</h5>
                </header>

                <main className="flex-grow-1" style={{ marginTop: headerHeight, padding: '20px' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;