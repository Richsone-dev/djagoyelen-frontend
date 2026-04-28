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
        primaryBlue: '#0d6efd' // Ajout de la couleur bleue
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
            localStorage.clear();
            window.location.href = '/login';
        } catch (error) {
            localStorage.clear();
            window.location.href = '/login';
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
    const footerHeight = '70px';

    return (
        <div className="d-flex" style={{ minHeight: '20vh', maxHeight: '50vh', backgroundColor: '#f8f9fa' }}>
            
            {/* 1. SIDEBAR FIXE */}
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
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    padding: isCollapsed && !isMobile ? '1.5rem 0.75rem' : '1.5rem',
                }}
            >
                <div className={`d-flex ${isCollapsed && !isMobile ? 'justify-content-center' : 'justify-content-between'} align-items-center mb-4`}>
                    <div 
                        className="d-flex align-items-center" 
                        onClick={() => !isMobile && setIsCollapsed(!isCollapsed)} 
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        {(!isCollapsed || isMobile) && (
                            <h4 className="fw-bold mb-0 ms-2" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>
                                <span style={{ color: colors.successGreen }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span>
                            </h4>
                        )}
                    </div>

                    {isMobile && (
                        <button className="btn text-white p-0 border-0" onClick={() => setIsSidebarOpen(false)}>
                            <i className="bi bi-x-lg fs-4"></i>
                        </button>
                    )}
                </div>

                <div className="flex-grow-1">
                    {menuSections.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            {(!isCollapsed || isMobile) && (
                                <small className="text-uppercase fw-bold text-muted mb-2 d-block" style={{ fontSize: '0.6rem', letterSpacing: '1px', opacity: 0.7 }}>
                                    {section.title}
                                </small>
                            )}
                            <ul className="nav flex-column">
                                {section.links.map((link) => (
                                    <li className="nav-item mb-1" key={link.path}>
                                        <Link 
                                            to={`/${link.path}`} 
                                            className={`nav-link text-white d-flex align-items-center ${isCollapsed && !isMobile ? 'justify-content-center' : ''} p-2 ${location.pathname === `/${link.path}` ? 'bg-white bg-opacity-10 shadow-sm' : ''}`}
                                            onClick={() => isMobile && setIsSidebarOpen(false)}
                                            style={{ borderRadius: '10px', transition: '0.3s' }}
                                        >
                                            <i className={`bi bi-${link.icon} fs-5`} style={{ color: '#ffffff', marginRight: (isCollapsed && !isMobile) ? '0' : '15px' }}></i>
                                            {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{link.label}</span>}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <button onClick={handleLogout} className={`btn border-0 text-white w-100 d-flex align-items-center ${isCollapsed && !isMobile ? 'justify-content-center' : ''} p-3 mt-4 mb-3`} style={{ backgroundColor: 'rgba(233, 114, 35, 0.1)', borderRadius: '12px' }}>
                    <i className="bi bi-power fs-5" style={{ color: colors.orange, marginRight: (isCollapsed && !isMobile) ? '0' : '15px' }}></i>
                    {(!isCollapsed || isMobile) && <span className="fw-bold" style={{ whiteSpace: 'nowrap' }}>Déconnexion</span>}
                </button>
            </nav>

            {/* 2. OVERLAY MOBILE */}
            {isSidebarOpen && (
                <div className="d-md-none position-fixed w-100 h-100" onClick={() => setIsSidebarOpen(false)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, top: 0, left: 0 }} />
            )}

            {/* 3. ZONE DE CONTENU PRINCIPALE */}
            <div 
                className="d-flex flex-column w-100" 
                style={{ 
                    marginLeft: sidebarWidth, 
                    transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    minHeight: '100vh'
                }}
            >
                {/* HEADER : TOUJOURS BLEU SUR TOUS LES ÉCRANS */}
                <header 
                    className="shadow-sm px-3 px-md-4 d-flex align-items-center"
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        right: 0,
                        left: sidebarWidth,
                        height: headerHeight,
                        zIndex: 1000,
                        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        backgroundColor: colors.darkGreen // Applique le bleu ici
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center">
                            {/* BOUTON MENU MOBILE */}
                            <button className="btn d-md-none me-2 shadow-sm" style={{backgroundColor: colors.orange, color: 'white', padding: '0.5rem, 0.5rem'}} onClick={() => setIsSidebarOpen(true)}>
                                <i className="bi bi-list fs-3" style={{ padding: '1px'}}></i>
                            </button>

                            {/* NOM DE L'APPLI : Texte blanc pour trancher sur le bleu */}
                            {isMobile && (
                                <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                                    <span style={{ color: 'white' }}>Djago</span>
                                    <span style={{ color: colors.orange }}>Yelen</span>
                                </h5>
                            )}
                            
                            <h5 className="mb-0 d-none d-md-block fw-bold text-white"
                                style={{ fontSize: '1.1rem', textTransform: 'capitalize'}}>
                                {menuSections.flatMap(s => s.links).find(l => `/${l.path}` === location.pathname)?.label || "Bienvenue"}
                            </h5>
                        </div>

                        <div className="d-flex align-items-center ms-auto">
                            <div className="position-relative me-3 me-md-4">
                                <i className="bi bi-bell fs-4" style={{ color: 'white' }}></i>
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" style={{ fontSize: '0.6rem' }}>2</span>
                            </div>
                            <Link to="/profil" className="text-decoration-none d-flex align-items-center p-1 pe-2 pe-md-3 rounded-pill border-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2" style={{ width: '32px', height: '32px', backgroundColor: colors.orange }}>
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="small d-none d-sm-block fw-bold text-white">{user?.name || 'Utilisateur'}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main 
                    className="flex-grow-1 bg-light" 
                    style={{ 
                        marginTop: headerHeight,
                        marginBottom: isMobile ? '70px' : '0'
                    }}
                >
                    <div className="container-fluid py-0 py-md-2">
                        <Outlet />
                    </div>
                </main>

                {/* FOOTER DESKTOP */}
                {!isMobile && (
                    <footer 
                        className="text-center d-flex align-items-center justify-content-center text-muted small border-top bg-white mt-auto"
                        style={{ height: footerHeight, width: '100%' }}
                    >
                        <div>
                            &copy; 2026 <strong>DjagoYelen</strong> — 
                            <span className="ms-2"><em>Karim & Françoise, Ingénieurs en Génie Logiciel</em></span>
                        </div>
                    </footer>
                )}

                {/* BOTTOM NAVIGATION MOBILE */}
                {isMobile && (
                    <div className="fixed-bottom border-top d-flex justify-content-around align-items-center shadow-lg" 
                        style={{ 
                            height: '70px', 
                            zIndex: 1040, 
                            backgroundColor: colors.darkGreen, 
                            borderRadius: '20px 20px 0 0' 
                        }}>
                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ display: 'flex', flexDirection: 'column', color: location.pathname === '/transactions' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                        <Link to="/transactions" className="text-center text-decoration-none" style={{ color: location.pathname === '/transactions' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                            <i className="bi bi-cash-stack fs-3"></i>
                        </Link>
                            <small style={{color: colors.white, fontSize: '6px', color: location.pathname === '/transactions' ? colors.orange : 'rgba(255,255,255,0.6)'}}>Transactions</small>

                        </div>
                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ display: 'flex', flexDirection: 'column', color: location.pathname === '/budgets' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                        <Link to="/budgets" className="text-center text-decoration-none" style={{ color: location.pathname === '/budgets' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                            <i className="bi bi-piggy-bank fs-3"></i>
                        </Link>
                            <small style={{color: colors.white, fontSize: '6px', color: location.pathname === '/budgets' ? colors.orange : 'rgba(255,255,255,0.6)'}}>Budget</small>
                            
                        </div>
                        
                        <div className="position-relative" style={{ top: '-25px',  display: 'flex', flexDirection: 'column' }}>
                            <Link to="/dashboard" className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center" 
                                style={{ backgroundColor: colors.darkGreen, color: 'white', width: '55px', height: '55px', border: `4px solid ${colors.white}`, color: location.pathname === '/dashboard' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                                <i className="bi bi-house-door-fill fs-3">
                                </i>
                            </Link>
                                   <small style={{color: colors.white, fontSize: '6px', color: location.pathname === '/dashboard' ? colors.orange : 'rgba(255,255,255,0.6)'}}>Tableau de bord</small>
                        </div>
                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ display: 'flex', flexDirection: 'column'}}>
                        <Link to="/rapports" className="text-center text-decoration-none" style={{ color: location.pathname === '/rapports' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                            <i className="bi bi-file-earmark-bar-graph fs-3"></i>
                        </Link>
                                   <small style={{color: colors.white, fontSize: '6px', color: location.pathname === '/rapports' ? colors.orange : 'rgba(255,255,255,0.6)'}}>Rapports</small>
                        
                        </div>
                        <div className="position-relative d-flex align-items-center justify-content-center" style={{ display: 'flex', flexDirection: 'column'}}>
                        <Link to="/profil" className="text-center text-decoration-none" style={{ color: location.pathname === '/profil' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                            <i className="bi bi-person-fill fs-3"></i>
                        </Link>
                                   <small style={{color: colors.white, fontSize: '6px', color: location.pathname === '/profil' ? colors.orange : 'rgba(255,255,255,0.6)'}}>Profil</small>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainLayout;