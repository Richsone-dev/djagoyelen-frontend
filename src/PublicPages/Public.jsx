import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import img2 from '../assets/img2.png';
import probleme from '../assets/probleme.svg';
import solution1 from '../assets/solution1.png';
import logo from '../assets/djago-logo.jpeg'; 
import visuel2 from '../assets/visuel2.jpeg';
import visuel3 from '../assets/visuel3.jpeg';
import progressiveApp from '../assets/progressiveApp.svg';
import InterfaceFinance from '../assets/InterfaceFinance.png';
import { Colors } from 'chart.js';
import whyUs from '../assets/whyUs.png';
import PcMobile from '../assets/PcMobile.png';

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
        <div className="min-vh-100 d-flex m-0 p-0 flex-column" style={{ backgroundColor: Colors.bodyBg, padding: 0, margin: 0 }}>
            
            {/* 1. BARRE DE NAVIGATION */}
            <nav 
                className="navbar navbar-expand-lg shadow-sm sticky-top py-3 animate__animated animate__fadeInDown custom-responsive-navbar" 
                style={{ 
                    backgroundColor: Colors.darkGreen, 
                    zIndex: 1050,
                    height: '100%',
                    transition: 'all 0.3s ease-in-out',
                    margin: -5
                }}
            >
                <div className="container">
                    {/* LOGO & NOM DE L'APPLI */}
                    <Link className="navbar-brand d-flex align-items-center text-decoration-none" to="/">
                        <img src={logo} alt="DjagoYelen Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                        <h5 className="fw-bold mb-0" style={{ fontSize: '1.1rem', marginLeft: '10px' }}>
                            <span style={{ color: 'white' }}>Djago</span>
                            <span style={{ color: colors.orange }}>Yelen</span>
                        </h5>
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
                    <div className={`custom-nav-collapse d-flex flex-column flex-lg-row justify-content-lg-end align-items-lg-right gap-3 ${isNavOpen ? 'open' : ''}`}>
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

                {/* DESIGN CSS INTEGRÉ ADAPTATIF */}
                <style dangerouslySetInnerHTML={{ __html: `
                    /* --- STYLE SUR LARGE ÉCRAN (Desktop) --- */
                    @media (min-width: 992px) {
                        .custom-responsive-navbar {
                            border-bottom: none !important;
                            border-radius: 0px !important;
                        }
                        .nav-overlay { display: none !important; }
                        .custom-nav-collapse { display: flex !important; flex-basis: auto; flex-grow: 1; }
                        .btn-outline-danger-custom { color: #ffffff; border: 1px solid #dc3545; background-color: #dc3545; }
                        .btn-outline-danger-custom:hover { background-color: #bd2130; border-color: #b21f2d; color: white; }
                        .btn-outline-dark-custom { color: #ffffff; border: 1px solid rgba(255,255,255,0.4); }
                        .btn-outline-dark-custom:hover { background-color: rgba(255,255,255,0.1); color: white; }
                    }
                    
                    /* --- STYLE SUR ÉCRAN MOBILE --- */
                    @media (max-width: 991.98px) {
                        .custom-responsive-navbar {
                            border-bottom: 2px solid ${Colors.orange} !important;
                            border-radius: 0 0 20px 20px !important;
                        }
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
                className={`fade ${heroVisible ? 'show' : ''} container mt-5 py-5 text-white d-flex align-items-center rounded-4 position-relative overflow-hidden hero-digital-finance`} 
                style={{ 
                    backgroundColor: Colors.darkGreen,
                    zIndex: 1
                }}
            >
                {/* Éléments d'arrière-plan de flux réseau */}
                <div className="digital-grid-overlay"></div>
                <div className="digital-glow-circle circle-1"></div>
                <div className="digital-glow-circle circle-2"></div>

                {/* CARTE D'AFRIQUE EN ARRIÈRE-PLAN (Opacité 20%) */}
                <div className="africa-bg-vector">
    <svg viewBox="0 0 2000 2000" fill="currentColor" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {/* Contours géographiques précis du continent africain et de Madagascar */}
        <path d="M720,290 C780,270 850,265 920,275 C950,280 1020,310 1050,315 C1110,325 1160,295 1220,300 C1260,305 1310,340 1340,370 C1380,410 1360,450 1390,500 C1410,535 1460,560 1480,600 C1510,660 1490,720 1520,780 C1540,820 1590,840 1600,890 C1615,960 1540,1010 1530,1080 C1520,1150 1560,1210 1540,1280 C1515,1370 1440,1430 1390,1510 C1340,1590 1280,1670 1210,1730 C1170,1765 1120,1830 1070,1810 C1040,1800 1030,1740 1010,1710 C970,1650 940,1580 920,1510 C900,1440 910,1370 890,1300 C870,1230 820,1180 790,1110 C760,1040 760,960 720,900 C690,855 640,830 600,790 C550,740 480,745 420,700 C370,660 350,590 310,540 C280,500 210,480 190,430 C170,380 230,340 260,300 C295,255 320,195 370,170 C430,140 500,180 570,160 C625,145 660,90 720,110 C760,125 770,180 800,210 C830,240 780,270 750,285 Z 
                 M1510,1330 C1530,1310 1550,1350 1560,1380 C1580,1440 1600,1500 1610,1560 C1620,1620 1610,1690 1580,1740 C1560,1770 1530,1750 1520,1710 C1510,1650 1530,1580 1520,1520 C1510,1460 1490,1400 1510,1330 Z" />
    </svg>
</div>

                {/* MULTIPLICATION DES PARTICULES (PIÈCES & ÉTOILES d'animation rapide) */}
                <div className="finance-particle coin-1"><i className="bi bi-coin"></i></div>
                <div className="finance-particle coin-2"><i className="bi bi-coin"></i></div>
                <div className="finance-particle coin-3"><i className="bi bi-coin"></i></div>
                <div className="finance-particle coin-4"><i className="bi bi-coin"></i></div>
                <div className="finance-particle coin-5"><i className="bi bi-coin"></i></div>
                
                <div className="finance-particle star-1"><i className="bi bi-star-fill"></i></div>
                <div className="finance-particle star-2"><i className="bi bi-star-fill"></i></div>
                <div className="finance-particle star-3"><i className="bi bi-star-fill"></i></div>
                <div className="finance-particle star-4"><i className="bi bi-star-fill"></i></div>
                <div className="finance-particle star-5"><i className="bi bi-star-fill"></i></div>

                <div className="container py-4 position-relative" style={{ zIndex: 2 }}>
                    <div className="row justify-content-center g-5 mb-5">
                        <div className="col-lg-10 text-center">
                            {/* Titre Principal */}
                            <h2 className="display-5 fw-bold mb-3">
                                <span style={{ color: 'whitesmoke' }}>Chaque Entreprise, chaque structure et chaque business mérite une bonne </span>
                                <span style={{ color: Colors.orange }}>Gestion Financière</span>
                            </h2>
                        </div>
                    </div>

                    {/* Section CTA / Boutons */}
                    <div className="row align-items-center g-5 border-top border-white border-opacity-10 pt-5">
                        <div className="col-lg-6 text-center text-lg-start">
                            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-start gap-3">
                                <Link 
                                    to={token ? "/dashboard" : "/register"} 
                                    className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg btn-hero-orange-slide transition-all btn-hero-primary btn-pulse-cta" 
                                    style={{ 
                                        backgroundColor: 'rgba(233, 114, 35, 0.15)', 
                                        border: '2px solid rgba(233, 114, 35, 0.4)', 
                                        borderRadius: '10px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        zIndex: 1
                                    }}
                                >
                                    {token ? "Accéder au Tableau de Bord" : "Créer un compte gratuit"} 
                                    <i className="bi bi-arrow-right ms-2 transition-arrow"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Styles CSS mis à jour */}
                <style dangerouslySetInnerHTML={{ __html: `
                    .hero-digital-finance {
                        background-image: linear-gradient(135deg, ${Colors.darkGreen} 0%, #114c3e 40%, #198754 75%, #b25013 100%) !important;
                        background-size: 400% 400% !important;
                        animation: digitalGradient 15s ease infinite !important;
                    }

                    @keyframes digitalGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    /* --- CARTE D'AFRIQUE EN ARRIÈRE-PLAN --- */
                    .africa-bg-vector {
                        position: absolute;
                        right: -5%;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 450px;
                        height: 450px;
                        color: rgba(255, 255, 255, 0.20); /* Opacité fixée à 20% */
                        pointer-events: none;
                        z-index: 1;
                    }

                    .digital-grid-overlay {
                        position: absolute;
                        inset: 0;
                        background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
                        background-size: 24px 24px;
                        opacity: 0.7;
                        pointer-events: none;
                    }

                    .digital-glow-circle {
                        position: absolute;
                        border-radius: 50%;
                        filter: blur(80px);
                        opacity: 0.25;
                        pointer-events: none;
                        mix-blend-mode: screen;
                    }

                    .circle-1 { width: 300px; height: 300px; background: #E97223; top: -10%; right: 10%; animation: floatGlow1 8s ease-in-out infinite alternate; }
                    .circle-2 { width: 400px; height: 400px; background: #198754; bottom: -20%; left: 5%; animation: floatGlow2 12s ease-in-out infinite alternate; }

                    @keyframes floatGlow1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-30px, 40px) scale(1.2); } }
                    @keyframes floatGlow2 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(40px, -30px) scale(0.9); } }

                    /* --- PARTICULES FLUIDES MULTIPLIÉES ET ACCÉLÉRÉES --- */
                    .finance-particle {
                        position: absolute;
                        pointer-events: none;
                        opacity: 0.5;
                        z-index: 1;
                    }

                    /* Distribution & Vitesse Augmentée (durations d'animations réduites à 3s - 5s) */
                    .coin-1 { top: 12%; left: 8%; color: #ffd700; font-size: 1.3rem; animation: floatFastLeft 4s linear infinite; }
                    .coin-2 { bottom: 20%; right: 12%; color: #e5e5e5; font-size: 1.1rem; animation: floatFastRight 4.5s linear infinite; }
                    .coin-3 { top: 40%; right: 30%; color: ${Colors.orange}; font-size: 1rem; animation: floatFastLeft 3.5s linear infinite; }
                    .coin-4 { bottom: 45%; left: 25%; color: #ffd700; font-size: 0.9rem; animation: floatFastRight 5s linear infinite; }
                    .coin-5 { top: 65%; right: 15%; color: #e5e5e5; font-size: 1.2rem; animation: floatFastLeft 4.2s linear infinite; }

                    .star-1 { top: 22%; right: 25%; color: #ffffff; font-size: 0.8rem; animation: floatFastRight 3.8s linear infinite; }
                    .star-2 { bottom: 15%; left: 15%; color: #ffeb3b; font-size: 1.2rem; animation: floatFastLeft 4.6s linear infinite; }
                    .star-3 { top: 75%; left: 35%; color: #00e676; font-size: 0.7rem; animation: floatFastRight 3s linear infinite; }
                    .star-4 { top: 10%; right: 45%; color: #ffffff; font-size: 1rem; animation: floatFastLeft 4.8s linear infinite; }
                    .star-5 { bottom: 30%; right: 35%; color: #ffeb3b; font-size: 0.7rem; animation: floatFastRight 3.4s linear infinite; }

                    /* Keyframes super dynamiques à haute vitesse et rotations continues */
                    @keyframes floatFastLeft {
                        0% { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.6; }
                        100% { transform: translate(-40px, -60px) rotate(360deg) scale(1.1); opacity: 0; }
                    }

                    @keyframes floatFastRight {
                        0% { transform: translate(0, 0) rotate(0deg) scale(1.1); opacity: 0; }
                        10% { opacity: 0.6; }
                        90% { opacity: 0.6; }
                        100% { transform: translate(50px, -50px) rotate(-360deg) scale(0.8); opacity: 0; }
                    }

                    /* Style Cta */
                    .btn-hero-orange-slide {
                        background-image: linear-gradient(to right, rgba(233, 114, 35, 0.8) 50%, transparent 50%);
                        background-size: 200% 100%;
                        background-position: right bottom;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .btn-hero-orange-slide:hover { background-position: left bottom; border-color: #E97223 !important; color: #ffffff !important; box-shadow: 0 8px 25px rgba(233, 114, 35, 0.4) !important; transform: translateY(-2px); }
                    .btn-hero-orange-slide:hover .transition-arrow { transform: translateX(4px); transition: transform 0.3s ease; }
                    .btn-hero-orange-slide:active { transform: translateY(1px); }
                `}} />
            </header>
            <header 
    ref={heroRef} 
    className={`fade ${heroVisible ? 'show' : ''} container mt-5 py-5 text-white d-flex align-items-center rounded-4`} 
    style={{ 
        backgroundColor: Colors.darkGreen, 
        backgroundImage: `linear-gradient(135deg, ${Colors.darkGreen} 0%, #135746 100%)` 
    }}
>
    <div className="container py-4">
        {/* Grille principale : Texte & Description à gauche, Image à droite */}
        <div className="row align-items-center g-5 mb-5">
            <div className="col-lg-6 text-center text-lg-start">
                {/* Titre Principal */}
                <h2 className="display-6 fw-bold mb-3">
                    <span style={{ color: 'whitesmoke' }}>Chaque idée, chaque structure et chaque business mérite une bonne </span>
                    <span style={{ color: Colors.orange }}>Gestion Financière</span>
                </h2>
                
                {/* Description de l'application */}
                <p className="lead opacity-75 mb-0" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Découvrez une plateforme intuitive conçue pour propulser la croissance des petites et moyennes entreprises africaines. Suivez vos flux de trésorerie, pilotez vos indicateurs de performance et éclairez vos décisions stratégiques en temps réel, sans la moindre complexité technique.
                </p>
            </div>

            <div className="col-lg-6 d-flex justify-content-center">
                <img
                    src={InterfaceFinance}
                    className="img-fluid shadow-lg rounded-4 border border-white border-opacity-10"
                    style={{ 
                        maxHeight: '400px', 
                        width: '100%', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                        objectFit: 'cover' 
                    }}
                    alt="Interface DjagoYelen"
                />
            </div>
        </div>

        {/* Section CTA / Boutons */}
        <div className="row align-items-center g-5 border-top border-white border-opacity-10 pt-5">
            <div className="col-lg-6 text-center text-lg-start">
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                    <Link 
                        to={token ? "/dashboard" : "/register"} 
                        className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg btn-hero-orange-slide btn-pulse-cta" 
                        style={{ 
                            backgroundColor: 'rgba(233, 114, 35, 0.15)', 
                            border: '2px solid rgba(233, 114, 35, 0.4)', 
                            borderRadius: '10px',
                            position: 'relative',
                            overflow: 'hidden',
                            zIndex: 1
                        }}
                    >
                        {token ? "Accéder au Tableau de Bord" : "Créer un compte gratuit"} 
                        <i className="bi bi-arrow-right ms-2 transition-arrow"></i>
                    </Link>
                </div>
            </div>
        </div>
    </div>

    {/* Styles injectés de manière isolée */}
    <style dangerouslySetInnerHTML={{ __html: `
        .btn-hero-orange-slide {
            background-image: linear-gradient(to right, rgba(233, 114, 35, 0.8) 50%, transparent 50%);
            background-size: 200% 100%;
            background-position: right bottom;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .btn-hero-orange-slide:hover {
            background-position: left bottom;
            border-color: #E97223 !important;
            color: #ffffff !important;
            box-shadow: 0 8px 25px rgba(233, 114, 35, 0.4) !important;
            transform: translateY(-2px);
        }

        .btn-hero-orange-slide:hover .transition-arrow {
            transform: translateX(4px);
            transition: transform 0.3s ease;
        }

        .btn-hero-orange-slide:active {
            transform: translateY(1px);
        }
    `}} />
</header>
            <header 
    ref={heroRef} 
    className={`fade ${heroVisible ? 'show' : ''} container mt-5 py-5 text-white d-flex align-items-center rounded-4 position-relative overflow-hidden hero-digital-finance`} 
    style={{ 
        backgroundColor: Colors.darkGreen,
        zIndex: 1
    }}
>
    {/* --- EFFETS DE FOND EN MOUVEMENT --- */}
    <div className="digital-grid-overlay"></div>
    <div className="digital-glow-circle circle-1"></div>
    <div className="digital-glow-circle circle-2"></div>

    {/* --- VECTEUR AFRIQUE PRÉCIS (100% OPAQUE) --- */}
    <div className="africa-bg-vector">
        <svg viewBox="0 0 2000 2000" fill="currentColor" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M720,290 C780,270 850,265 920,275 C950,280 1020,310 1050,315 C1110,325 1160,295 1220,300 C1260,305 1310,340 1340,370 C1380,410 1360,450 1390,500 C1410,535 1460,560 1480,600 C1510,660 1490,720 1520,780 C1540,820 1590,840 1600,890 C1615,960 1540,1010 1530,1080 C1520,1150 1560,1210 1540,1280 C1515,1370 1440,1430 1390,1510 C1340,1590 1280,1670 1210,1730 C1170,1765 1120,1830 1070,1810 C1040,1800 1030,1740 1010,1710 C970,1650 940,1580 920,1510 C900,1440 910,1370 890,1300 C870,1230 820,1180 790,1110 C760,1040 760,960 720,900 C690,855 640,830 600,790 C550,740 480,745 420,700 C370,660 350,590 310,540 C280,500 210,480 190,430 C170,380 230,340 260,300 C295,255 320,195 370,170 C430,140 500,180 570,160 C625,145 660,90 720,110 C760,125 770,180 800,210 C830,240 780,270 750,285 Z M1510,1330 C1530,1310 1550,1350 1560,1380 C1580,1440 1600,1500 1610,1560 C1620,1620 1610,1690 1580,1740 C1560,1770 1530,1750 1520,1710 C1510,1650 1530,1580 1520,1520 C1510,1460 1490,1400 1510,1330 Z" />
        </svg>
    </div>

    {/* --- PLUIE DE PARTICULES RAPIDES MULTICOLORES --- */}
    <div className="finance-particle coin-1"><i className="bi bi-coin"></i></div>
    <div className="finance-particle coin-2"><i className="bi bi-coin"></i></div>
    <div className="finance-particle coin-3"><i className="bi bi-coin"></i></div>
    <div className="finance-particle coin-4"><i className="bi bi-coin"></i></div>
    <div className="finance-particle coin-5"><i className="bi bi-coin"></i></div>
    
    <div className="finance-particle star-1"><i className="bi bi-star-fill"></i></div>
    <div className="finance-particle star-2"><i className="bi bi-star-fill"></i></div>
    <div className="finance-particle star-3"><i className="bi bi-star-fill"></i></div>
    <div className="finance-particle star-4"><i className="bi bi-star-fill"></i></div>
    <div className="finance-particle star-5"><i className="bi bi-star-fill"></i></div>

    <div className="container py-4 position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center g-5">
            
            {/* Colonne Gauche : Présentation et Contenu */}
            <div className="col-lg-6 text-center text-lg-start">
                <h2 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.1', letterSpacing: '-1px' }}>
                    <span>Djago</span><span style={{ color: Colors.orange }}>Yelen</span>
                </h2>
                
                <h3 className="h4 fw-light mb-3 text-white-50">
                    Propulsez la gestion de votre <span style={{ color: Colors.orange, fontWeight: '600' }}>Business</span>
                </h3>

                <p className="lead mb-4 opacity-75" style={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
                    La solution ultime numérique de gestion conçue pour les entreprises, les PME et les structures individuelles. 
                    <span className="d-block mt-2">
                        <strong style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Notre objectif :</strong> centraliser vos opérations, maîtriser vos budgets, gérer vos factures et clarifier vos indicateurs financiers au quotidien.
                    </span>
                </p>
                
                {/* Liste des Tags Fonctionnalités */}
                <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-2 mb-4">
                    {['Tableau de bord', 'Transactions', 'Budgets', 'Facturation', 'Rapports', 'Catégories', 'Clients'].map((tag) => (
                        <span
                            key={tag}
                            className="badge rounded-pill px-3 py-2 function-tag"
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backdropFilter: 'blur(5px)'
                            }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Bouton d'action CTA */}
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                    <Link 
                        to={token ? "/dashboard" : "/register"} 
                        className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg btn-hero-orange-slide btn-pulse-cta" 
                        style={{ 
                            backgroundColor: 'rgba(233, 114, 35, 0.15)', 
                            border: '2px solid rgba(233, 114, 35, 0.4)', 
                            borderRadius: '10px',
                            position: 'relative',
                            overflow: 'hidden',
                            zIndex: 1
                        }}
                    >
                        {token ? "Accéder au Tableau de Bord" : "Créer un compte gratuit"} 
                        <i className="bi bi-arrow-right ms-2 transition-arrow"></i>
                    </Link>
                </div>
            </div>

            {/* Colonne Droite : Visuel de l'Interface */}
            <div className="col-lg-6 d-flex justify-content-center position-relative">
                <div className="image-container-overlay">
                    <img
                        src={img2}
                        className="img-fluid shadow-lg rounded-4 border border-white border-opacity-10 visual-hero-mockup"
                        style={{ maxHeight: '420px', objectFit: 'cover', width: '100%' }}
                        alt="Interface DjagoYelen"
                    />
                </div>
            </div>

        </div>
    </div>

    {/* --- STYLES ISOLÉS --- */}
    <style dangerouslySetInnerHTML={{ __html: `
        .hero-digital-finance {
            background-image: linear-gradient(135deg, ${Colors.darkGreen} 0%, #114c3e 40%, #198754 75%, #b25013 100%) !important;
            background-size: 400% 400% !important;
            animation: digitalGradient 12s ease infinite !important;
        }

        @keyframes digitalGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Carte d'Afrique 100% opaque, intégrée harmonieusement */
        .africa-bg-vector {
            position: absolute;
            right: -8%;
            top: 45%;
            transform: translateY(-50%);
            width: 550px;
            height: 550px;
            color: rgba(255, 255, 255, 0.08); /* Ajusté pour ne pas gêner la lisibilité tout en restant net */
            pointer-events: none;
            z-index: 1;
        }

        .digital-grid-overlay {
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 0);
            background-size: 28px 28px;
            pointer-events: none;
        }

        .digital-glow-circle {
            position: absolute;
            border-radius: 50%;
            filter: blur(90px);
            opacity: 0.22;
            pointer-events: none;
        }
        .circle-1 { width: 350px; height: 350px; background: #E97223; top: -10%; right: 15%; animation: floatGlow1 7s ease-in-out infinite alternate; }
        .circle-2 { width: 420px; height: 420px; background: #198754; bottom: -15%; left: -5%; animation: floatGlow2 10s ease-in-out infinite alternate; }

        @keyframes floatGlow1 { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-20px, 30px) scale(1.15); } }
        @keyframes floatGlow2 { 0% { transform: translate(0, 0) scale(1.1); } 100% { transform: translate(30px, -20px) scale(0.95); } }

        /* Particules en mouvement rapide */
        .finance-particle {
            position: absolute;
            pointer-events: none;
            opacity: 0;
            z-index: 1;
        }

        .coin-1 { top: 15%; left: 7%; color: #ffd700; font-size: 1.3rem; animation: floatFastLeft 3.5s linear infinite; }
        .coin-2 { bottom: 25%; right: 8%; color: #e5e5e5; font-size: 1.1rem; animation: floatFastRight 4s linear infinite; }
        .coin-3 { top: 35%; right: 40%; color: #E97223; font-size: 1rem; animation: floatFastLeft 3s linear infinite; }
        .coin-4 { bottom: 35%; left: 45%; color: #ffd700; font-size: 0.9rem; animation: floatFastRight 4.5s linear infinite; }
        .coin-5 { top: 60%; left: 12%; color: #e5e5e5; font-size: 1.1rem; animation: floatFastLeft 3.8s linear infinite; }

        .star-1 { top: 20%; right: 20%; color: #ffffff; font-size: 0.8rem; animation: floatFastRight 3.2s linear infinite; }
        .star-2 { bottom: 12%; left: 22%; color: #ffeb3b; font-size: 1.2rem; animation: floatFastLeft 4.2s linear infinite; }
        .star-3 { top: 70%; left: 50%; color: #00e676; font-size: 0.7rem; animation: floatFastRight 2.8s linear infinite; }
        .star-4 { top: 8%; right: 30%; color: #ffffff; font-size: 0.9rem; animation: floatFastLeft 4.4s linear infinite; }
        .star-5 { bottom: 45%; right: 22%; color: #ffeb3b; font-size: 0.7rem; animation: floatFastRight 3.1s infinite linear; }

        @keyframes floatFastLeft {
            0% { transform: translate(0, 0) rotate(0deg) scale(0.7); opacity: 0; }
            15% { opacity: 0.6; }
            85% { opacity: 0.6; }
            100% { transform: translate(-50px, -70px) rotate(360deg) scale(1.1); opacity: 0; }
        }

        @keyframes floatFastRight {
            0% { transform: translate(0, 0) rotate(0deg) scale(1.1); opacity: 0; }
            15% { opacity: 0.6; }
            85% { opacity: 0.6; }
            100% { transform: translate(60px, -60px) rotate(-360deg) scale(0.7); opacity: 0; }
        }

        .function-tag {
            transition: all 0.3s ease;
        }
        .function-tag:hover {
            transform: translateY(-2px);
            background-color: rgba(255, 255, 255, 0.2) !important;
            border-color: #E97223 !important;
        }

        /* CTA Effect */
        .btn-hero-orange-slide {
            background-image: linear-gradient(to right, rgba(233, 114, 35, 0.8) 50%, transparent 50%);
            background-size: 200% 100%;
            background-position: right bottom;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .btn-hero-orange-slide:hover { background-position: left bottom; border-color: #E97223 !important; color: #ffffff !important; box-shadow: 0 8px 25px rgba(233, 114, 35, 0.4) !important; transform: translateY(-2px); }
        .btn-hero-orange-slide:hover .transition-arrow { transform: translateX(4px); transition: transform 0.3s ease; }
        .btn-hero-orange-slide:active { transform: translateY(1px); }
    `}} />
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
                    img={PcMobile}
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
                                <a href="https://api.whatsapp.com/send?phone=+22665395514&text=Salut%2C%20puis-je%20savoir%20un%20peu%20plus%20sur%20l'application%20DjagoYelen%20%3F" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-whatsapp"></i></a>
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
                        <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-center gap-3 mb-3">
                            <img src={probleme} alt="Icône Problème" style={{ maxWidth: '30%', maxHeight: '30%', objectFit: 'contain' }} />
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
                        <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-center gap-3 mb-3">
                            <img src={solution1} alt="Icône Solution" style={{ maxWidth: '30%', maxHeight: '30%', objectFit: 'contain' }} />
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
                        {/* text-start cale tout le texte à gauche */}
                        <div className="p-4 rounded-4 shadow-sm h-100 card-feature text-start" style={cardStyle}>
                            
                            {/* L'icône reste isolée en haut, calée à gauche grâce à sa nature d'inline-flex */}
                            <div className="mb-3 border border-1 border-success d-inline-flex rounded-3 p-2" 
                                style={{ 
                                    backgroundColor: 'rgba(25, 135, 84, 0.1)', 
                                    color: '#198754', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    width: '48px', 
                                    height: '48px' 
                                }}
                            >
                                <i className={`bi bi-${f.icon} fs-3`}></i>
                            </div>
                            
                            {/* Le texte se déroule naturellement en dessous */}
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
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-center gap-3">
                                        <img
                                            src={probleme}
                                            className="img-fluid shadow-lg rounded-4 px-3 py-2 border border-white border-opacity-20 "
                                            style={{ maxHeight: '600px',maxWidth: '30%',backgroundColor: 'rgba(255, 255, 255, 0.3)', shadow: '0 0 10px rgba(255, 255, 255, 0.5)', objectFit: 'cover', marginBottom: '40px'}}
                                            alt="Interface DjagoYelen"
                                        />

                            </div>
                <div className="col-lg-7">
                    <h2 className="fw-bold text-white mb-3">Pourquoi choisir DjagoYelen ?</h2>
                    <p className=" mb-0 " >
                        Contrairement aux logiciels complexes lourds et à usage compliqué, <span className="fw-bold" style={{color: 'green', borderBottom: '1px solid orange'}}>Djago</span><span className="fw-bold" style={{color: 'orange', borderBottom: '1px solid green'}}>Yelen</span> va droit au but. Il s'intègre parfaitement aux flux de travail réels des commerçants, des prestataires de services et des petites entreprises d'Afrique de l'Ouest, offrant une agilité unique sans nécessiter de compétences avancées en comptabilité.
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
                    className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg transition-all btn-hero-orange-slide transition-all btn-hero-primary btn-pulse-cta" 
                                    style={{ 
                                        backgroundColor: 'rgba(10, 59, 47, 1)',
                                        border: '2px solid rgba(233, 114, 35, 0.4)', 
                                        borderRadius: '10px',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        zIndex: 1
                                    }}
                >
                    {token ? "Retourner au Tableau de bord" : "Commencer dès maintenant"}
                    <i className="bi bi-arrow-right ms-2 transition-arrow"></i>
                </Link>
            </div>
        </section>
    );
};

export default Public;