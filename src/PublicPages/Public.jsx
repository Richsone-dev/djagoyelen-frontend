import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import img2 from '../assets/img2.png';
import probleme from '../assets/probleme.svg';
import solution1 from '../assets/solution1.png';
import logo from '../assets/djago-logo.jpeg'; 
import visuel2 from '../assets/visuel2.jpeg';
import visuel3 from '../assets/visuel3.jpeg';

// Hook personnalisé pour l'animation au défilement
const useScrollAnimation = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.15 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return [ref, visible];
};

// COMPOSANT PRINCIPAL : PUBLIC
const Public = () => {
    const token = localStorage.getItem('token');
    const { colors, isDarkMode } = useTheme(); // Récupération du mode sombre si dispo
    const [heroRef, heroVisible] = useScrollAnimation();
    const [isNavOpen, setIsNavOpen] = useState(false);

    // Ajustement dynamique des couleurs de secours si le contexte ne les fournit pas
    const currentOrange = colors.orange || '#198754';
    const currentDarkGreen = colors.darkGreen || '#0A3B2F';

    const cardStyle = {
        backgroundColor: colors.cardBg || (isDarkMode ? '#1e293b' : '#ffffff'),
        color: colors.textColor || (isDarkMode ? '#f8fafc' : '#212529'),
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.05)',
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsNavOpen(false);
        window.location.reload();
    };

    const Colors = {
        darkGreen: currentDarkGreen,
        orange: currentOrange,
        White: '#ffffff',
        bodyBg: colors.bodyBg || (isDarkMode ? '#0f172a' : '#f8f9fa'),
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: Colors.bodyBg }}>
            
            {/* 1. BARRE DE NAVIGATION */}
            <nav 
                className="navbar navbar-expand-lg shadow-sm sticky-top py-3 animate__animated animate__fadeInDown" 
                style={{ 
                    backgroundColor: Colors.darkGreen, 
                    borderBottom: '2px solid ' + Colors.orange, 
                    borderRadius: '0 0 15px 15px', 
                    zIndex: 1050 
                }}
            >
                <div className="container">
                    {/* LOGO & NOM DE L'APPLI */}
                    <Link className="navbar-brand d-flex align-items-center text-decoration-none" to="/">
                        <img src={logo} alt="DjagoYelen Logo" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
                        <span className="fw-bold ms-2 fs-4 tracking-tight">
                            <span style={{ color: Colors.White }}>Djago</span><span style={{ color: Colors.orange }}>Yelen</span>
                        </span>
                    </Link>
                    
                    {/* BOUTON BURGER POUR MOBILE */}
                    <button 
                        className="navbar-toggler border border-white shadow-sm d-lg-none ms-auto" 
                        type="button" 
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        aria-label="Toggle navigation"
                        style={{ zIndex: 1100, width: '40px', height: '40px', border: 2, backgroundColor: Colors.orange, borderRadius: '6px', borderColor: Colors.White, justifyContent: 'center', alignItems: 'center', display: 'flex' }} 
                    >
                        <i className={`bi ${isNavOpen ? 'bi-x-lg text-white' : 'bi-list'} fs-3`} style={{ color: !isNavOpen ? '#ffffff' : undefined }}></i>
                    </button>

                    {/* OVERLAY (Arrière-plan sombre en mode mobile) */}
                    <div 
                        className={`nav-overlay ${isNavOpen ? 'active' : ''}`} 
                        onClick={() => setIsNavOpen(false)} 
                    />

                    {/* CONTENU DU MENU COLLAPSE AVEC GLISSEMENT LATÉRAL */}
                    <div className={`custom-nav-collapse d-flex flex-column flex-lg-row justify-content-lg-end align-items-lg-center gap-3 ${isNavOpen ? 'open' : ''}`}>
                        <div className="d-flex flex-column flex-lg-row gap-2 w-100 w-lg-auto align-items-stretch align-items-lg-center">
                            {token ? (
                                <>
                                    {/* BOUTON TABLEAU DE BORD */}
                                    <Link 
                                        to="/dashboard" 
                                        className="btn text-white fw-bold px-4 shadow-sm text-center" 
                                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <i className="bi bi-speedometer2 me-2"></i>Mon Espace
                                    </Link>

                                    {/* BOUTON DÉCONNEXION */}
                                    <button 
                                        onClick={handleLogout}
                                        className="btn btn-outline-danger-custom fw-bold px-3 text-center" 
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <i className="bi bi-box-arrow-right me-2" style={{ color: '#dc3545' }}></i>Déconnexion
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* BOUTON CONNEXION */}
                                    <Link 
                                        to="/login" 
                                        className="btn btn-outline-dark-custom fw-bold px-3 text-center" 
                                        style={{ borderRadius: '8px' }}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <i className="bi bi-box-arrow-in-right me-2 d-lg-none"></i>Connexion
                                    </Link>

                                    {/* BOUTON INSCRIPTION */}
                                    <Link 
                                        to="/register" 
                                        className="btn text-white fw-bold px-3 text-center btn-pulse-cta" 
                                        style={{ backgroundColor: Colors.orange, borderRadius: '8px' }}
                                        onClick={() => setIsNavOpen(false)}
                                    >
                                        <i className="bi bi-person-plus me-2 d-lg-none"></i>S'inscrire
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* DESIGN CSS INJECTÉ */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @media (min-width: 992px) {
                        .nav-overlay { display: none !important; }
                        .custom-nav-collapse { display: flex !important; flex-basis: auto; flex-grow: 1; }
                        .btn-outline-danger-custom { color: #ffffff; border: 1px solid #dc3545; background-color: #dc3545; }
                        .btn-outline-danger-custom:hover { background-color: #bd2130; border-color: #b21f2d; color: white; }
                        .btn-outline-dark-custom { color: #ffffff; border: 1px solid rgba(255,255,255,0.4); }
                        .btn-outline-dark-custom:hover { background-color: rgba(255,255,255,0.1); color: white; }
                    }
                    @media (max-width: 991.98px) {
                        .nav-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; z-index: 1040; }
                        .nav-overlay.active { opacity: 1; visibility: visible; }
                        .custom-nav-collapse { position: fixed; top: 0; right: -100%; bottom: 0; width: 280px; background-color: ${Colors.darkGreen}; padding: 80px 24px 24px 24px; transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3); z-index: 1050; display: flex; }
                        .custom-nav-collapse.open { right: 0; }
                        .btn-outline-dark-custom, .btn-outline-danger-custom { color: #ffffff !important; border: 1px solid rgba(255, 255, 255, 0.25) !important; background-color: rgba(255, 255, 255, 0.08); }
                        .btn-outline-dark-custom:active, .btn-outline-danger-custom:active { background-color: rgba(255, 255, 255, 0.2); }
                    }
                `}} />
            </nav>

            {/* 3. SECTION HERO */}
            <header 
                ref={heroRef} 
                className={`fade ${heroVisible ? 'show' : ''} container mt-5 py-5 text-white d-flex align-items-center rounded-4`} 
                style={{ 
                    backgroundColor: Colors.darkGreen, 
                    backgroundImage: `linear-gradient(135deg, ${Colors.darkGreen} 0%, #135746 100%)` 
                }}
            >
                <div className="container py-4">
                    <div className="row justify-content-center g-5 mb-5">
                        <div className="col-lg-10 text-center">
                            <h2 className="display-5 fw-bold mb-3">
                                <span style={{ color: 'whitesmoke' }}>Djago</span>
                                <span style={{ color: Colors.orange }}>Yelen</span>
                            </h2>
                            <p className="lead mb-4 opacity-75" style={{ lineHeight: 1.7 }}>
                                DjagoYelen est une solution numérique de gestion financière conçue pour
                                les entrepreneurs, les PME et les structures en activité en Afrique de
                                l'Ouest. Notre objectif : centraliser vos opérations, clarifier vos
                                indicateurs et faciliter vos décisions au quotidien.
                            </p>
                            
                            <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                                {['Tableau de bord', 'Transactions', 'Budgets', 'Facturation', 'Rapports', 'Catégories', 'Clients', 'Notifications'].map((tag) => (
                                    <span
                                        key={tag}
                                        className="badge rounded-pill px-3 py-2"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255, 255, 255, 0.08)'
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <img
                                src={img2}
                                className="img-fluid shadow-lg rounded-4 border border-white border-opacity-10"
                                style={{ maxHeight: '500px', objectFit: 'cover', width: '100%', marginBottom: '40px'}}
                                alt="Interface DjagoYelen"
                            />
                        </div>
                    </div>

                    <div className="row align-items-center g-5 border-top border-white border-opacity-10 pt-5">
                        <div className="col-lg-6 text-center text-lg-start">
                            <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.1', letterSpacing: '-1px' }}>
                                Propulsez la gestion de votre <span style={{ color: Colors.orange }}>Business</span>
                            </h1>
                            <p className="lead opacity-75 mb-4 fs-5">
                                Suivez vos transactions, maîtrisez vos budgets, gérez vos factures et analysez vos rapports financiers sur une seule et unique plateforme intuitive.
                            </p>
                            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                                <Link 
                                    to={token ? "/dashboard" : "/register"} 
                                    className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg border-0 transition-all btn-hero-primary btn-pulse-cta" 
                                    style={{ backgroundColor: Colors.orange, borderRadius: '10px' }}
                                >
                                    {token ? "Accéder au Tableau de Bord" : "Créer un compte gratuit"} <i className="bi bi-arrow-right ms-2 transition-arrow"></i>
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-6 text-center">
                            <div className="p-4 rounded-3 shadow-lg bg-white bg-opacity-10 backdrop-blur d-inline-block">
                                <i className="bi bi-wallet2" style={{ fontSize: '120px', color: Colors.orange }}></i>
                                <div className="mt-2 fw-bold text-uppercase tracking-wider">DjagoYelen Finance v1.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* INTERLUDES MISSIONS ET AMBITIONS */}
            <div className="container mt-5">
                <Section
                    title="Notre mission"
                    img={visuel2}
                    text="Offrir aux entreprises locales un outil fiable, accessible et adapté à leurs réalités : suivi des revenus et d'épargne, maîtrise des budgets, gestion des clients et émission de factures, le tout depuis une interface simple et sécurisée."
                    colors={Colors}
                />
                <Section
                    title="Notre ambition"
                    img={visuel3}
                    text="Devenir la référence régionale en matière de gestion financière simplifiée, en combinant rigueur comptable, innovation technologique et proximité avec les besoins du terrain."
                    colors={Colors}
                    reverse
                />
            </div>

            {/* CONTENU SUIVANT & FONCTIONNALITÉS */}
            <div className="container mt-5">
                <ProblemSolution colors={Colors} cardStyle={cardStyle} />
                <Features colors={Colors} cardStyle={cardStyle} />
                <Values colors={Colors} cardStyle={cardStyle} />
                <WhyUs colors={Colors} />
                <CTA colors={Colors} />
            </div>

            {/* 6. PIED DE PAGE (FOOTER) */}
            <footer className="py-5 small mt-auto border-top" style={{ backgroundColor: isDarkMode ? '#1e2523' : '#324540', borderTopColor: 'rgba(255,255,255,0.1)' }}>
                <div className="container">
                    <div className="row g-4 mb-4 text-start">
                        <div className="col-lg-4 col-md-6">
                            <div className="d-flex align-items-center mb-3 text-decoration-none">
                                <img src={logo} alt="DjagoYelen Logo" style={{ width: '35px', height: '35px', borderRadius: '8px', objectFit: 'cover' }} />
                                <span className="fw-bold ms-2 fs-5 tracking-tight">
                                    <span style={{ color: isDarkMode ? '#ffffff' : '#198754' }}>Djago</span><span style={{ color: Colors.orange }}>Yelen</span>
                                </span>
                            </div>
                            <p className="text-white-50" style={{ lineHeight: '1.6' }}>
                                La solution numérique de gestion financière pensée pour propulser les entrepreneurs et PME en Afrique de l'Ouest. Suivez vos flux, maîtrisez vos budgets.
                            </p>
                            <div className="d-flex gap-3 mt-3">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-facebook"></i></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-linkedin"></i></a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-github"></i></a>
                                <a href="https://wa.me/22665395514" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-whatsapp"></i></a>
                            </div>
                        </div>

                        <div className="col-lg-2 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Navigation</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2">
                                <li><Link to="/apropos" className="premium-animated-link"><i className='bi bi-info-circle me-2'></i>À Propos</Link></li>
                                <li><Link to="/dashboard" className="premium-animated-link"><i className='bi bi-speedometer2 me-2'></i>Mon Espace</Link></li>
                                <li><Link to="/login" className="premium-animated-link"><i className='bi bi-box-arrow-in-right me-2'></i>Connexion</Link></li>
                                <li><Link to="/register" className="premium-animated-link"><i className='bi bi-person-plus me-2'></i>Inscription</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Fonctionnalités</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2">
                                <li><Link to="/transactions" className="premium-animated-link"><i className="bi bi-cash-stack me-2"></i>Transactions</Link></li>
                                <li><Link to="/budgets" className="premium-animated-link"><i className="bi bi-piggy-bank me-2"></i>Budgets & Alertes</Link></li>
                                <li><Link to="/factures" className="premium-animated-link"><i className="bi bi-receipt me-2"></i>Facturation</Link></li>
                                <li><Link to="/rapports" className="premium-animated-link"><i className="bi bi-file-earmark-bar-graph me-2"></i>Rapports Analytiques</Link></li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Contact & Support</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 text-white-50">
                                <li className="d-flex align-items-start gap-2">
                                    <i className="bi bi-geo-alt-fill text-danger mt-1"></i>
                                    <span className="text-white-50">Bobo-Dioulasso, Burkina Faso</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <i className="bi bi-envelope-fill text-white-50"></i>
                                    <a href="mailto:djagoyelen@gmail.com" className="premium-animated-link">djagoyelen@gmail.com</a>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <i className="bi bi-telephone-fill text-success"></i>
                                    <a href="tel:+22665395514" className="premium-animated-link">+226 65 39 55 14</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-secondary opacity-25 my-4" />

                    <div className="d-flex justify-content-center align-items-center gap-3">
                        <div className="text-white-50">
                            &copy; 2026 <strong className="text-white">DjagoYelen</strong>. Tous droits réservés.
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `
                    .text-white-50-hover { transition: opacity 0.2s ease-in-out; }
                    .text-white-50-hover:hover { opacity: 0.8; color: ${Colors.orange} !important; }
                `}} />
            </footer>
            
            {/* STYLES CSS GLOBALS ET EFFETS ANIMATIONS RÉGULIÈRES */}
            <style dangerouslySetInnerHTML={{ __html: `
                /* Base d'animations */
                .fade { opacity: 0; transform: translateY(32px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
                .fade.show { opacity: 1; transform: translateY(0); }
                
                /* Cartes Premium */
                .premium-card { transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s; }
                .premium-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); }
                
                .card-feature { transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
                .card-feature:hover { transform: translateY(-5px); border-color: ${Colors.orange} !important; box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
                
                /* --- DESIGN DES LIENS PROFESSIONNELS --- */
                .premium-animated-link {
                    color: rgba(255, 255, 255, 0.7) !important;
                    text-decoration: none;
                    position: relative;
                    transition: color 0.25s ease;
                    display: inline-flex;
                    align-items: center;
                }
                .premium-animated-link i {
                    transition: transform 0.25s ease;
                }
                .premium-animated-link:hover {
                    color: #ffffff !important;
                }
                .premium-animated-link:hover i {
                    transform: translateX(4px);
                    color: ${Colors.orange} !important;
                }
                /* Soulignement pro fluide */
                .premium-animated-link::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    transform: scaleX(0);
                    height: 2px;
                    bottom: -2px;
                    left: 0;
                    background-color: ${Colors.orange};
                    transform-origin: bottom right;
                    transition: transform 0.25s ease-out;
                }
                .premium-animated-link:hover::after {
                    transform: scaleX(1);
                    transform-origin: bottom left;
                }

                /* Lien "Voir plus" spécifique */
                .feature-link {
                    text-decoration: none;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    position: relative;
                    padding-bottom: 2px;
                }
                .feature-link i {
                    transition: transform 0.2s ease;
                }
                .feature-link:hover i {
                    transform: translateX(5px);
                }

                /* --- ANIMATION RÉGULIÈRE POUR ATTENTION --- */
                @keyframes pulseAttention {
                    0% { transform: scale(1); box-shadow: 0 4px 15px rgba(25, 135, 84, 0.4); }
                    4% { transform: scale(1.03); box-shadow: 0 6px 20px rgba(25, 135, 84, 0.6); }
                    8% { transform: scale(1); box-shadow: 0 4px 15px rgba(25, 135, 84, 0.4); }
                    12% { transform: scale(1.03); box-shadow: 0 6px 20px rgba(25, 135, 84, 0.6); }
                    16% { transform: scale(1); box-shadow: 0 4px 15px rgba(25, 135, 84, 0.4); }
                    100% { transform: scale(1); box-shadow: 0 4px 15px rgba(25, 135, 84, 0.4); }
                }
                .btn-pulse-cta {
                    animation: pulseAttention 3.5s infinite ease-in-out;
                }

                /* --- GESTION DU THEME SOMBRE (DARK MODE) --- */
                .text-adaptive {
                    color: ${isDarkMode ? 'rgba(255, 255, 255, 0.75)' : '#6c757d'} !important;
                    transition: color 0.3s ease;
                }
                h2, h5, h4 {
                    color: ${isDarkMode ? '#ffffff' : Colors.darkGreen};
                }
                
                /* Si utilisation de classes Bootstrap standard du Dark Mode */
                [data-bs-theme="dark"] .premium-card { 
                    border: 1px solid rgba(255, 255, 255, 0.08) !important; 
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important; 
                }
                [data-bs-theme="dark"] .premium-animated-link {
                    color: rgba(255, 255, 255, 0.6) !important;
                }
                [data-bs-theme="dark"] .premium-animated-link:hover {
                    color: ${Colors.orange} !important;
                }
            `}} />
        </div>
    );
};

// --- TABLEAUX DE DONNÉES ---
const FEATURES = [
    { icon: 'cash-stack', title: 'Transactions', desc: 'Enregistrez vos revenus et dépenses, classez-les par catégorie et consultez l\'historique complet.', link: '/transactions' },
    { icon: 'piggy-bank', title: 'Budgets', desc: 'Définissez des plafonds par période et suivez votre consommation avec des alertes automatiques.', link: '/budgets' },
    { icon: 'receipt', title: 'Facturation', desc: 'Créez des factures professionnelles, gérez vos clients et exportez vos documents en PDF.', link: '/factures' },
    { icon: 'file-earmark-bar-graph', title: 'Rapports', desc: 'Visualisez vos performances financières grâce à des synthèses et graphiques clairs.', link: '/rapports' },
    { icon: 'people', title: 'Clients', desc: 'Centralisez les coordonnées et l\'historique de vos relations commerciales.', link: '/clients' },
    { icon: 'bell', title: 'Notifications', desc: 'Recevez des alertes utiles pour ne pas dépasser vos budgets et rester informé.', link: '/notifications' },
    { icon: 'gear', title: 'Paramètres', desc: 'Personnalisez votre expérience, gérez vos préférences et sécurisez votre compte.', link: '/parametres' },
    { icon: 'shield-lock', title: 'Sécurité', desc: 'Vos données sont protégées par des protocoles modernes et un chiffrement robuste.', link: '/securite' },
];

const VALUES = [
    { title: 'Clarté', desc: 'Des interfaces lisibles et des données présentées de façon compréhensible.' },
    { title: 'Fiabilité', desc: 'Une base technique stable, avec authentification sécurisée et sauvegarde des données.' },
    { title: 'Proximité', desc: 'Une solution taillée pour répondre directement aux réalités économiques locales.' }
];

// --- SOUS COMPOSANTS ---
const Section = ({ title, text, img, colors, reverse = false }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className={`row align-items-center g-4 g-lg-5 ${reverse ? 'flex-lg-row-reverse' : ''}`}>
                <div className="col-lg-6">
                    <h2 className="fw-bold mb-3">{title}</h2>
                    <p className="mb-0 opacity-75 text-adaptive" style={{ lineHeight: 1.75, fontSize: '1.05rem' }}>{text}</p>
                </div>
                <div className="col-lg-6">
                    <img src={img} className="img-fluid rounded-4 shadow" alt={title} style={{ objectFit: 'cover', width: '100%' }} />
                </div>
            </div>
        </section>
    );
};

const ProblemSolution = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-4">Le constat &amp; notre réponse</h2>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-danger" style={cardStyle}>
                        <div className="mb-3">
                            <img src={probleme} alt="Icône Problème" style={{ width: 48, height: 48 }} />
                        </div>
                        <h5 className="text-danger fw-bold mb-2">Les difficultés rencontrées</h5>
                        <ul className="mb-0 ps-3 opacity-75 text-adaptive" style={{ lineHeight: 1.7 }}>
                            <li className="mb-2">Gestion éparpillée sur papier ou fichiers Excel complexes.</li>
                            <li className="mb-2">Difficulté à anticiper les fins de mois et à suivre la trésorerie réelle.</li>
                            <li className="mb-2">Facturation artisanale qui manque de professionnalisme.</li>
                            <li>Manque d'outils analytiques adaptés au contexte régional.</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-success" style={cardStyle}>
                        <div className="mb-3">
                            <img src={solution1} alt="Icône Solution" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                        </div>
                        <h5 className="text-success fw-bold mb-2">La solution DjagoYelen</h5>
                        <ul className="mb-0 ps-3 opacity-75 text-adaptive" style={{ lineHeight: 1.7 }}>
                            <li className="mb-2">Une plateforme tout-en-un accessible depuis n'importe quel appareil.</li>
                            <li className="mb-2">Une vision claire de vos bénéfices, dépenses et budgets en temps réel.</li>
                            <li className="mb-2">Émission instantanée de documents professionnels et gestion client de confiance.</li>
                            <li>Une interface pensée pour la rapidité opérationnelle du terrain.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Features = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-2">Fonctionnalités principales</h2>
            <p className="text-center mb-4 col-lg-8 mx-auto text-adaptive">
                Des modules pensés pour couvrir l'essentiel de la gestion financière d'une activité moderne.
            </p>
            <div className="row g-3 g-md-4">
                {FEATURES.map((f) => (
                    <div className="col-md-6 col-lg-3" key={f.title}>
                        <div className="p-4 rounded-4 shadow-sm h-100 card-feature" style={cardStyle}>
                            <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-3 p-2" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
                                <i className={`bi bi-${f.icon} fs-3`}></i>
                            </div>
                            <h5 className="fw-bold mb-2">{f.title}</h5>
                            <p className="small opacity-75 text-adaptive mb-3">{f.desc}</p>
                            <Link to={f.link} className="feature-link text-decoration-none fw-bold small" style={{ color: colors.orange }}>
                                Voir plus <i className="bi bi-chevron-right small ms-1"></i>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Values = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-4">Nos Valeurs</h2>
            <div className="row g-4">
                {VALUES.map((v) => (
                    <div className="col-md-4" key={v.title}>
                        <div className="p-4 rounded-4 shadow-sm text-center h-100 premium-card" style={cardStyle}>
                            <h4 className="fw-bold mb-3" style={{ color: colors.orange }}>{v.title}</h4>
                            <p className="mb-0 opacity-75 text-adaptive">{v.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const WhyUs = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 p-5 rounded-4 text-white fade ${visible ? 'show' : ''}`} style={{ backgroundColor: colors.darkGreen }}>
            <div className="row align-items-center g-4">
                <div className="col-lg-7">
                    <h2 className="fw-bold text-white mb-3">Pourquoi choisir DjagoYelen ?</h2>
                    <p className="opacity-75 mb-0" style={{ lineHeight: 1.7 }}>
                        Contrairement aux logiciels occidentaux complexes et lourds, DjagoYelen va droit au but. Il s'intègre parfaitement aux flux de travail réels des commerçants, des prestataires de services et des petites entreprises d'Afrique de l'Ouest, offrant une agilité unique sans nécessiter de compétences avancées en comptabilité.
                    </p>
                </div>
                <div className="col-lg-5 text-center text-lg-end">
                    <div className="display-4 fw-bold" style={{ color: colors.orange }}>100%</div>
                    <div className="text-uppercase tracking-wider small opacity-75">Adapté aux réalités locales</div>
                </div>
            </div>
        </section>
    );
};

const CTA = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();
    const token = localStorage.getItem('token');
    return (
        <section ref={ref} className={`mb-5 text-center py-5 fade ${visible ? 'show' : ''}`}>
            <div className="py-4">
                <h2 className="fw-bold mb-3">Prêt à illuminer vos finances ?</h2>
                <p className="text-adaptive mb-4 col-lg-6 mx-auto">
                    Rejoignez les entrepreneurs qui font confiance à DjagoYelen pour piloter leur croissance en toute sérénité.
                </p>
                <Link 
                    to={token ? "/dashboard" : "/register"} 
                    className="btn btn-lg text-white fw-bold px-5 py-3 btn-pulse-cta"
                    style={{ backgroundColor: colors.orange, borderRadius: '10px' }}
                >
                    {token ? "Retourner au Tableau de bord" : "Commencer dès maintenant"}
                </Link>
            </div>
        </section>
    );
};

export default Public;