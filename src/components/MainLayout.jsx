import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import logo from '../assets/djago-logo.jpeg';
import NotificationBell from './NotificationBell';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEnterprise } from '../context/EnterpriseContext.jsx';
import { getMediaUrl } from '../utils/mediaUrl';

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

    const { theme, setTheme, colors: themeColors } = useTheme();
    const { t } = useLanguage();
    const { entreprise } = useEnterprise();

    const profilePhotoUrl = user?.id_photo ? getMediaUrl(user.id_photo) : null;
    const [photoError, setPhotoError] = useState(false);

    useEffect(() => {
        setPhotoError(false);
    }, [profilePhotoUrl]);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        red: '#dc3545',
        white: '#ffffff',
        successGreen: '#198754',
        accentPurple: '#6f42c1',
        primaryBlue: '#0d6efd',
        blue: '#0dcaf0',
        blueLight: 'rgba(13, 110, 253, 0.1)',
        blueDark: 'rgba(13, 110, 253, 0.2)',
        redLight: 'rgba(220, 53, 69, 0.1)',
        greenLight: 'rgba(25, 135, 84, 0.1)',
        purpleLight: 'rgba(111, 66, 193, 0.1)',
        orangeLight: 'rgba(233, 114, 35, 0.1)',
        yellowLight: 'rgba(255, 193, 7, 0.1)',
    };

    // Gestion unifiée et dynamique des fonds selon le thème
    const sidebarBackground = theme === 'dark' ? '#0b2e21' : colors.darkGreen;
    const headerBackground = theme === 'dark' ? colors.darkGreen : '#1e5f38'; // 👈 Appliqué au header et au footer mobile
    const pageBackground = theme === 'dark' ? '#121212' : themeColors.bgLight;
    const textColor = theme === 'dark' ? '#f8f9fa' : themeColors.textColor;

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
            // Déconnexion forcée
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
            links: [
                { path: 'dashboard', label: t('dashboard'), icon: 'speedometer2' },
                { path: 'transactions', label: t('transactions'), icon: 'cash-stack' },
                { path: 'category', label: t('categories'), icon: 'tags' },
                { path: 'budgets', label: t('budgets'), icon: 'piggy-bank' },
                { path: 'rapports', label: t('reports'), icon: 'file-earmark-bar-graph' },
                { path: 'profil', label: t('profile'), icon: 'person' },
                { path: 'apropos', label: t('about'), icon: 'info-circle' },
                { path: 'parametres', label: t('settings'), icon: 'gear' },
                { path: 'clients', label: t('clients'), icon: 'people' },
                { path: 'factures', label: t('invoices'), icon: 'receipt' },
                { path: 'notifications', label: t('notifications'), icon: 'bell' },
                { path: 'aide', label: t('help'), icon: 'question-circle', disabled: true, tooltip: "Bientôt disponible", color: colors.accentPurple },
                { path: 'dettes', label: t('debts'), icon: 'person-dash', disabled: true, tooltip: "Bientôt disponible", color: colors.accentPurple },
            ],
        },
        ...(user?.role === 'admin' ? [{
            title: t('administration'),
            links: [
                { path: '/admin/dashboard', label: t('admin'), icon: 'shield-lock', color: colors.orange, external: true }
            ]
        }] : []),
        ...(user?.role === 'manager' ? [{
            title: t('management'),
            links: [
                { path: 'gestion', label: t('management'), icon: 'briefcase', color: colors.primaryBlue }
            ]
        }] : []),
    ];

    const sidebarWidth = isMobile ? '0px' : (isCollapsed ? '70px' : '250px');
    const headerHeight = '72px';
    const footerHeight = '70px';

    return (
        <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: pageBackground, color: textColor }}>
            
            <nav 
                className="d-flex flex-column shadow" 
                style={{ 
                    width: isMobile ? (isSidebarOpen ? '250px' : '0') : sidebarWidth, 
                    backgroundColor: sidebarBackground, 
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
                <div className={`d-flex ${isCollapsed && !isMobile ? 'justify-content-center' : 'justify-content-between'} align-items-center mb-4`} style={{backgroundColor: colors.white, borderRadius: '10px', padding: '5px'}}>
                    <div className="d-flex align-items-center" onClick={() => !isMobile && setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                        <img src={logo} alt="Logo DjagoYelen" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        {(!isCollapsed || isMobile) && (
                            <div className="ms-2" style={{ minWidth: 0 }}>
                                <h4 className="fw-bold mb-0" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                                    <span style={{ color: colors.successGreen }}>Djago</span>
                                    <span style={{ color: colors.orange }}>Yelen</span>
                                </h4>
                                {entreprise?.nom && (
                                    <small
                                        className="d-block text-truncate text-muted"
                                        style={{ maxWidth: '160px', fontSize: '0.72rem' }}
                                    >
                                        {entreprise.nom}
                                    </small>
                                )}
                            </div>
                        )}
                    </div>
                    {isMobile && (
                        <button className="btn text-dark p-0 border-0" onClick={() => setIsSidebarOpen(false)}>
                            <i className="bi bi-x-lg fs-5"></i>
                        </button>
                    )}
                </div>

                <div className="flex-grow-1">
                    {menuSections.map((section, idx) => (
                        <div key={idx} className="mb-4">
                            {(!isCollapsed || isMobile) && section.title && (
                                <small className="text-uppercase fw-bold text-muted mb-2 d-block" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)'}}>
                                    {section.title}
                                </small>
                            )}
                            <ul className="nav flex-column">
                                {section.links.map((link) => (
                                    <li className="nav-item mb-1" key={link.path}>
                                        {link.disabled ? (
                                            <span className="nav-link text-white d-flex align-items-center p-2" style={{ borderRadius: '10px', transition: '0.3s', cursor: 'not-allowed', backgroundColor: 'rgba(233, 114, 35, 0.05)', opacity: 0.5 }} title={link.tooltip || "Indisponible"}>
                                                <i className={`bi bi-${link.icon} fs-5`} style={{ marginRight: (isCollapsed && !isMobile) ? '0' : '15px' }}></i>
                                                {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{link.label} (Bientôt)</span>}
                                            </span>
                                        ) : (
                                            <Link 
                                                to={link.path.startsWith('/') ? link.path : `/${link.path}`}
                                                className={`nav-link text-white d-flex align-items-center ${isCollapsed && !isMobile ? 'justify-content-center' : ''} p-2 ${location.pathname === (link.path.startsWith('/') ? link.path : `/${link.path}`) ? 'bg-white bg-opacity-10 shadow-sm fw-bold' : ''}`}
                                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                                style={{ borderRadius: '10px', transition: '0.3s' }}
                                            >
                                                <i className={`bi bi-${link.icon} fs-5`} style={{ marginRight: (isCollapsed && !isMobile) ? '0' : '15px', color: link.color || '#ffffff' }}></i>
                                                {(!isCollapsed || isMobile) && <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{link.label}</span>}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <button onClick={handleLogout} className={`btn border-0 text-white w-100 d-flex align-items-center ${isCollapsed && !isMobile ? 'justify-content-center' : ''} p-3 mt-4 mb-3`} style={{ backgroundColor: theme === 'dark' ? 'rgba(231, 111, 81, 0.14)' : 'rgba(233, 114, 35, 0.1)', borderRadius: '12px' }}>
                    <i className="bi bi-power fs-5" style={{ color: colors.orange, marginRight: (isCollapsed && !isMobile) ? '0' : '15px' }}></i>
                    {(!isCollapsed || isMobile) && <span className="fw-bold" style={{ whiteSpace: 'nowrap' }}>{t('logout')}</span>}
                </button>
            </nav>

            {isSidebarOpen && (
                <div className="d-md-none position-fixed w-100 h-100" onClick={() => setIsSidebarOpen(false)} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040, top: 0, left: 0 }} />
            )}

            <div className="d-flex flex-column w-100" style={{ marginLeft: sidebarWidth, transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', minHeight: '100vh', backgroundColor: pageBackground, color: textColor }}>
                {/* Header mis à jour avec la variable de fond thématique */}
                <header className="shadow px-3 px-md-4 d-flex align-items-center" style={{ position: 'fixed', top: 0, right: 0, left: sidebarWidth, height: headerHeight, zIndex: 1000, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderBottom: isMobile ? `2px solid ${colors.orange}` : 'none', borderRadius: isMobile ? '0 0 20px 20px' : '0', boxShadow: isMobile ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: headerBackground }}>
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center">
                            <button className="btn d-md-none me-2 px-1 py-0 shadow-sm" style={{backgroundColor: colors.orange, color: 'white'}} onClick={() => setIsSidebarOpen(true)}>
                                <i className="bi bi-list fs-3"></i>
                            </button>
                            <Link to="/" className="text-decoration-none d-flex align-items-center">
                                {isMobile && (
                                    <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                                        <span style={{ color: 'white' }}>Djago</span>
                                        <span style={{ color: colors.orange }}>Yelen</span>
                                    </h5>
                                )}
                            </Link>
                            <h5 className="mb-0 d-none d-md-block fw-bold text-white" style={{ fontSize: '1.1rem', textTransform: 'capitalize'}}>
                                {menuSections.flatMap(s => s.links).find(l => {
                                    const p = l.path.startsWith('/') ? l.path : `/${l.path}`;
                                    return p === location.pathname;
                                })?.label || "Bienvenue"}
                            </h5>
                        </div>
                        
                        <div className="d-flex align-items-center ms-auto gap-2">
                            <Link to="/notifications" className="d-flex align-items-center">
                                <NotificationBell />
                            </Link>

                            <div className="d-none d-md-flex gap-1 p-1 ms-2 me-2 rounded-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                                <button 
                                    type="button"
                                    className="btn p-0 d-flex align-items-center justify-content-center rounded-circle border-0"
                                    onClick={() => setTheme('light')}
                                    style={{ 
                                        width: '32px', 
                                        height: '32px',
                                        backgroundColor: theme === 'light' ? colors.white : 'transparent',
                                        color: theme === 'light' ? colors.darkGreen : 'rgba(255, 255, 255, 0.6)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Mode Clair"
                                >
                                    <i className="bi bi-sun-fill fs-6"></i>
                                </button>
                                <button 
                                    type="button"
                                    className="btn p-0 d-flex align-items-center justify-content-center rounded-circle border-0"
                                    onClick={() => setTheme('dark')}
                                    style={{ 
                                        width: '32px', 
                                        height: '32px',
                                        backgroundColor: theme === 'dark' ? colors.orange : 'transparent',
                                        color: theme === 'dark' ? colors.white : 'rgba(255, 255, 255, 0.6)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    title="Mode Sombre"
                                >
                                    <i className="bi bi-moon-stars-fill fs-6"></i>
                                </button>
                            </div>

                            <button
                                type="button"
                                className="btn d-md-none p-0 d-flex align-items-center justify-content-center rounded-circle border-0 ms-1 me-1"
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    color: theme === 'dark' ? colors.orange : '#ffffff',
                                    transition: 'all 0.2s ease'
                                }}
                                title={theme === 'light' ? "Passer au Mode Sombre" : "Passer au Mode Clair"}
                            >
                                <i className={`bi bi-${theme === 'light' ? 'sun-fill' : 'moon-stars-fill'} fs-5`}></i>
                            </button>

                            <Link to="/profil" className="text-decoration-none d-flex align-items-center p-1 pe-2 pe-md-3 rounded-pill border-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                                {profilePhotoUrl && !photoError ? (
                                    <img
                                        src={profilePhotoUrl}
                                        alt={user?.name || 'Profil'}
                                        className="rounded-circle me-md-2"
                                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                        onError={() => setPhotoError(true)}
                                    />
                                ) : (
                                    <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-md-2" style={{ width: '32px', height: '32px', backgroundColor: colors.orange }}>
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                <span className="small d-none d-sm-block fw-bold text-white">{user?.name || 'Profil'}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="flex-grow-1 overflow-auto" style={{ marginTop: headerHeight, marginBottom: isMobile ? '70px' : '0', backgroundColor: pageBackground, color: textColor }}>
                    <div className="container-fluid py-3 py-md-4">
                        <Outlet />
                    </div>
                </main>

                {!isMobile && (
                    <footer className="text-center d-flex align-items-center justify-content-center small border-top mt-auto" style={{ height: footerHeight, width: '100%' }}>
                        <div>&copy; 2026 <strong>DjagoYelen</strong> tous droits réservés.</div>
                    </footer>
                )}

                {isMobile && (
                    /* Footer Mobile mis à jour avec la variable headerBackground (thématique) */
                    <div className="fixed-bottom border-top d-flex mt-auto justify-content-around align-items-center" style={{ boxShadow: '0 -4px 13px rgba(0, 0, 0, 0.3)', height: '70px', zIndex: 1040, backgroundColor: headerBackground, borderRadius: '20px 20px 0 0', transition: 'background-color 0.3s ease',borderTop:'2px solid orange' }}>
                        <Link to="/transactions" className="text-center text-decoration-none" style={{ color: location.pathname === '/transactions' ? colors.orange : 'rgba(255,255,255,0.6)', maxWidth: '80px'}}>
                            <i className="bi bi-cash-stack fs-3"></i><br/><small style={{fontSize: '8px'}}>Transactions</small>
                        </Link>
                        <Link to="/budgets" className="text-center text-decoration-none" style={{ color: location.pathname === '/budgets' ? colors.orange : 'rgba(255,255,255,0.6)', maxWidth: '80px' }}>
                            <i className="bi bi-piggy-bank fs-3"></i><br/><small style={{fontSize: '8px'}}>Budget</small>
                        </Link>
                        <div style={{ top: '-25px', position: 'relative' }}>
                            {/* Le contour du bouton s'adapte lui aussi à la couleur thématique en cours */}
                            <Link to="/dashboard" className="btn rounded-circle shadow-lg d-flex align-items-center justify-content-center" style={{ backgroundColor: colors.white, width: '55px', height: '55px', border: `4px solid ${headerBackground}`, transition: 'border-color 0.3s ease'}}>
                                <i className="bi bi-house-door-fill fs-3" 
                                style={{
                                    color: location.pathname === '/dashboard' ? colors.orange : 'darkgreen', 
                                    maxWidth: '80px',
                                    textShadow: '0 2px 3px rgba(0, 0, 0, 0.5)' // Utilisation de textShadow pour l'icône
                                }}
                                ></i>
                            </Link>
                        </div>
                        <Link to="/factures" className="text-center text-decoration-none" style={{ color: location.pathname === '/factures' ? colors.orange : 'rgba(255,255,255,0.6)', maxWidth: '80px' }}>
                            <i className="bi bi-receipt fs-3"></i><br/><small style={{fontSize: '8px'}}>Factures</small>
                        </Link>
                        <Link to="/profil" className="text-center text-decoration-none" style={{ color: location.pathname === '/profil' ? colors.orange : 'rgba(255,255,255,0.6)' }}>
                            <i className="bi bi-person-fill fs-3"></i><br/><small style={{fontSize: '8px'}}>Profil</small>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainLayout;