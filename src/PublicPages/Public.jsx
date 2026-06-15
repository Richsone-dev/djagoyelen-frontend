import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import img2 from '../assets/img2.png';
import probleme from '../assets/probleme.svg';
import solution1 from '../assets/solution1.png';
import karimProfil from '../assets/karimProfil.jpeg';
import francoiseProfil from '../assets/francoiseProfil.jpeg';
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
    const [activeGuide, setActiveGuide] = useState('step1');
    const { colors } = useTheme();
    const [heroRef, heroVisible] = useScrollAnimation();

    const cardStyle = {
        backgroundColor: colors.cardBg,
        color: colors.textColor,
        border: 'none',
    };

               // 1. En haut de ton composant (ajoute la fonction de déconnexion selon ta logique) :
 const [isNavOpen, setIsNavOpen] = useState(false);
 const handleLogout = () => {
     localStorage.removeItem('token'); // ou ta logique de nettoyage
     setIsNavOpen(false);
     window.location.reload(); // ou redirection avec un navigate
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: colors.lightBg || '#f4f6f8', overflowX: 'hidden' }}>
            
            {/* 1. BARRE DE NAVIGATION */}

<nav 
    className="navbar navbar-expand-lg mb-5 shadow-sm bg-white sticky-top py-3 animate__animated animate__fadeInDown position-fixed w-100 z-index-sticky" 
    style={{ backgroundColor: colors.lightBg || '#f4f6f8' }}
>
    <div className="container">
        {/* LOGO & NOM DE L'APPLI */}
        <Link className="navbar-brand d-flex align-items-center text-decoration-none" to="/">
            <img src={logo} alt="DjagoYelen Logo" style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }} />
            <span className="fw-bold ms-2 fs-4 tracking-tight">
                <span style={{ color: '#198754' }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span>
            </span>
        </Link>
        
        {/* BOUTON BURGER POUR MOBILE */}
        <button 
            className="navbar-toggler border-2 shadow-none ms-auto" 
            type="button" 
            onClick={() => setIsNavOpen(!isNavOpen)}
            aria-label="Toggle navigation"
            style={{ zIndex: 1100}} 
        >
            <i className={`bi ${isNavOpen ? 'bi-x-lg text-white' : 'bi-list'} fs-3`} style={{ color: !isNavOpen ? colors.darkGreen : undefined }}></i>
        </button>

        {/* OVERLAY (Arrière-plan sombre en mode mobile) */}
        <div 
            className={`nav-overlay ${isNavOpen ? 'active' : ''}`} 
            onClick={() => setIsNavOpen(false)} 
        />

        {/* CONTENU DU MENU COLLAPSE AVEC GLISSEMENT LATÉRAL */}
        {/* Remplacement des mauvaises classes par justify-content-lg-end et flex-lg-row */}
        <div className={`custom-nav-collapse d-flex flex-column flex-lg-row justify-content-lg-end align-items-lg-center gap-3 ${isNavOpen ? 'open' : ''}`}>
            <div className="d-flex flex-column flex-lg-row gap-2 w-100 w-lg-auto align-items-stretch align-items-lg-center">
                {token ? (
                    <>
                        {/* BOUTON TABLEAU DE BORD */}
                        <Link 
                            to="/dashboard" 
                            className="btn text-white fw-bold px-4 shadow-sm text-center" 
                            style={{ backgroundColor: colors.darkGreen, borderRadius: '8px' }}
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
                            className="btn text-white fw-bold px-3 text-center" 
                            style={{ backgroundColor: colors.orange, borderRadius: '8px' }}
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
        /* --- CONFIGURATION DES ÉCRANS LARGES (PC) --- */
        @media (min-width: 992px) {
            .nav-overlay {
                display: none !important;
            }
            .custom-nav-collapse {
                display: flex !important;
                flex-basis: auto;
                flex-grow: 1;
            }
            .btn-outline-danger-custom {
                color: #dc3545;
                border: 1px solid #dc3545;
            }
            .btn-outline-danger-custom:hover {
                background-color: #dc3545;
                color: white;
            }
            .btn-outline-dark-custom {
                color: #212529;
                border: 1px solid #212529;
            }
            .btn-outline-dark-custom:hover {
                background-color: #212529;
                color: white;
            }
        }

        /* --- CONFIGURATION ÉCRANS MOBILES (TABLETTE & SMARTPHONE) --- */
        @media (max-width: 991.98px) {
            .nav-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                z-index: 1040;
            }

            .nav-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            .custom-nav-collapse {
                position: fixed;
                top: 0;
                right: -100%;
                bottom: 0;
                width: 280px;
                background-color: ${colors.darkGreen || '#0A3B2F'};
                padding: 80px 24px 24px 24px;
                transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: -5px 0 25px rgba(0, 0, 0, 0.3);
                z-index: 1050;
                display: flex;
            }
            
            .custom-nav-collapse.open {
                right: 0;
            }

            .btn-outline-dark-custom, .btn-outline-danger-custom {
                color: #ffffff !important;
                border: 1px solid rgba(255, 255, 255, 0.25) !important;
                background-color: rgba(255, 255, 255, 0.08);
            }
            .btn-outline-dark-custom:active, .btn-outline-danger-custom:active {
                background-color: rgba(255, 255, 255, 0.2);
            }
        }
    `}} />
</nav>

            {/* 3. SECTION COMPLÉMENTAIRE HERO ACCROCHE */}
            <header 
    ref={heroRef} 
    className={`fade ${heroVisible ? 'show' : ''} container mt-5 py-5 text-white d-flex align-items-center rounded-4`} 
    style={{ 
        backgroundColor: colors.darkGreen, 
        backgroundImage: 'linear-gradient(135deg, #0A3B2F 0%, #135746 100%)' 
    }}
>
    <div className="container py-4">

        {/* Ligne secondaire pour la présentation détaillée de l'application */}
        <div className="row justify-content-center g-5 mb-5">
            <div className="col-lg-10 text-center">
                <h2 className="display-5 fw-bold mb-3">
                    <span style={{ color: 'whitesmoke' }}>Djago</span>
                    <span style={{ color: colors.orange }}>Yelen</span>
                </h2>
                <p className="lead mb-4 opacity-75" style={{ lineHeight: 1.7 }}>
                    DjagoYelen est une solution numérique de gestion financière conçue pour
                    les entrepreneurs, les PME et les structures en activité en Afrique de
                    l'Ouest. Notre objectif : centraliser vos opérations, clarifier vos
                    indicateurs et faciliter vos décisions au quotidien.
                </p>
                
                {/* Badges de Fonctionnalités */}
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                    {['Tableau de bord', 'Transactions', 'Budgets', 'Facturation', 'Rapports', 'Catégories', 'Clients', 'Notifications', '...'].map((tag) => (
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

                {/* Capture d'écran de l'interface */}
                <img
                    src={img2}
                    className="img-fluid shadow-lg rounded-4 border border-white border-opacity-10"
                    style={{ maxHeight: '500px', objectFit: 'cover', width: '100%', marginBottom: '40px'}}
                    alt="Interface DjagoYelen"
                />
            </div>
        </div>
        {/* Ligne principale pour l'accroche "Propulsez la gestion..." */}
        <div className="row align-items-center g-5 border-top border-white border-opacity-10 pt-5">
            {/* Colonne Gauche : Texte de présentation et CTA */}
            <div className="col-lg-6 text-center text-lg-start">
                <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.1', letterSpacing: '-1px' }}>
                    Propulsez la gestion de votre <span style={{ color: colors.orange }}>Business</span>
                </h1>
                <p className="lead opacity-75 mb-4 fs-5">
                    Suivez vos transactions, maîtrisez vos budgets, gérez vos factures et analysez vos rapports financiers sur une seule et unique plateforme intuitive.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                    <Link 
                        to={token ? "/dashboard" : "/register"} 
                        className="btn btn-lg fw-bold px-4 py-3 text-white shadow-lg border-0 transition-all btn-hero-primary" 
                        style={{ backgroundColor: colors.orange, borderRadius: '10px' }}
                    >
                        {token ? "Accéder au Tableau de Bord" : "Créer un compte gratuit"} <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                </div>
            </div>

            {/* Colonne Droite : Visuel Portefeuille */}
            <div className="col-lg-6 text-center">
                <div className="p-4 rounded-3 shadow-lg bg-white bg-opacity-10 backdrop-blur d-inline-block">
                    <i className="bi bi-wallet2" style={{ fontSize: '120px', color: colors.orange }}></i>
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
                    text="Offrir aux entreprises locales un outil fiable, accessible et adapté à leurs réalités : suivi des revenus et dépenses, maîtrise des budgets, gestion des clients et émission de factures, le tout depuis une interface simple et sécurisée."
                    colors={colors}
                />
                <Section
                    title="Notre ambition"
                    img={visuel3}
                    text="Devenir la référence régionale en matière de gestion financière simplifiée, en combinant rigueur comptable, innovation technologique et proximité avec les besoins du terrain."
                    colors={colors}
                    reverse
                />
            </div>

            

            {/* 5. STRUCTURE ET COMPOSANTS APRES HERO */}
            <div className="container mt-5">
                <ProblemSolution colors={colors} cardStyle={cardStyle} />
                {/* <Features colors={colors} cardStyle={cardStyle} /> */}
                <Values colors={colors} cardStyle={cardStyle} />
                <WhyUs colors={colors} />
                <CTA colors={colors} />
            </div>

            {/* 6. PIED DE PAGE (FOOTER) */}
            <footer className="py-5 text-muted small mt-auto border-top border-secondary border-opacity-20" style={{ background: '#324540' }}>
                <div className="container">
                    {/* Partie supérieure du Footer : Grille de navigation */}
                    <div className="row g-4 mb-4 text-start">
                        
                        {/* Colonne 1 : À propos & Logo */}
                        <div className="col-lg-4 col-md-6">
                            <div className="d-flex align-items-center mb-3 text-decoration-none">
                                <img src={logo} alt="DjagoYelen Logo" style={{ width: '35px', height: '35px', borderRadius: '8px', objectFit: 'cover' }} />
                                <span className="fw-bold ms-2 fs-5 tracking-tight">
                                    <span style={{ color: '#198754' }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span>
                                </span>
                            </div>
                            <p className="opacity-75 text-white-50" style={{ lineHeight: '1.6' }}>
                                La solution numérique de gestion financière pensée pour propulser les entrepreneurs et PME en Afrique de l'Ouest. Suivez vos flux, maîtrisez vos budgets.
                            </p>
                            <div className="d-flex gap-3 mt-3">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-facebook"></i></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-linkedin"></i></a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white text-white-50-hover fs-5"><i className="bi bi-github"></i></a>
                            </div>
                        </div>

                        {/* Colonne 2 : Liens Utiles */}
                        <div className="col-lg-2 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Navigation</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2">
                                <li><Link to="/apropos" className="text-decoration-none text-white-50 text-white-hover"><i className='bi bi-info-circle text-white me-2'></i>À Propos</Link></li>
                                <li><Link to="/dashboard" className="text-decoration-none text-white-50 text-white-hover"><i className='bi bi-speedometer2 text-white me-2'></i>Mon Espace</Link></li>
                                <li><Link to="/login" className="text-decoration-none text-white-50 text-white-hover"><i className='bi bi-box-arrow-in-right text-white me-2'></i>Connexion</Link></li>
                                <li><Link to="/register" className="text-decoration-none text-white-50 text-white-hover"><i className='bi bi-person-plus text-white me-2'></i>Inscription</Link></li>
                            </ul>
                        </div>

                        {/* Colonne 3 : Modules / Fonctionnalités */}
                        <div className="col-lg-3 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Fonctionnalités</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2">
                                <li><Link to="/transactions" className="text-decoration-none text-white-50 text-white-hover"><i className="bi bi-cash-stack me-2 text-white"></i>Transactions</Link></li>
                                <li><Link to="/budgets" className="text-decoration-none text-white-50 text-white-hover"><i className="bi bi-piggy-bank me-2 text-white"></i>Budgets & Alertes</Link></li>
                                <li><Link to="/factures" className="text-decoration-none text-white-50 text-white-hover"><i className="bi bi-receipt me-2 text-white"></i>Facturation</Link></li>
                                <li><Link to="/rapports" className="text-decoration-none text-white-50 text-white-hover"><i className="bi bi-file-earmark-bar-graph me-2 text-white"></i>Rapports Analytiques</Link></li>
                            </ul>
                        </div>

                        {/* Colonne 4 : Contacts & Support */}
                        <div className="col-lg-3 col-md-6">
                            <h6 className="text-white fw-bold text-uppercase mb-3" style={{ letterSpacing: '0.05em', fontSize: '0.85rem' }}>Contact & Support</h6>
                            <ul className="list-unstyled d-flex flex-column gap-2 text-white-50 ">
                                <li className="d-flex align-items-start gap-2">
                                    <i className="bi bi-geo-alt-fill text-danger text-white-hover mt-1"></i>
                                    <span>Bobo-Dioulasso, Burkina Faso</span>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <i className="bi bi-envelope-fill text-white-50 text-white-hover"></i>
                                    <a href="mailto:djagoyelen@gmail.com" className="text-decoration-none text-white-50 text-white-hover">djagoyelen@gmail.com</a>
                                </li>
                                <li className="d-flex align-items-center gap-2">
                                    <i className="bi bi-telephone-fill text-success text-white-hover"></i>
                                    <a href="tel:+22665395514" className="text-decoration-none text-white-50 text-white-hover">+226 65 39 55 14</a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Ligne de séparation fine */}
                    <hr className="border-secondary opacity-100 my-4" />

                    {/* Partie inférieure du Footer : Droits d'auteur */}
                    <div className="justify-content-center align-items-center gap-3">
                        <div className="text-white-50">
                            &copy; 2026 <strong className="text-white">DjagoYelen</strong>. Tous droits réservés.
                        </div>
                        
                    </div>
                </div>

                {/* Ajout de styles locaux spécifiques pour gérer les effets de survol sur fond sombre */}
                <style dangerouslySetInnerHTML={{ __html: `
                    .text-white-hover {
                        transition: color 0.2s ease-in-out;
                    }
                    .text-white-hover:hover {
                        color: #ffffff !important;
                    }
                    .text-white-50-hover {
                        transition: opacity 0.2s ease-in-out;
                    }
                    .text-white-50-hover:hover {
                        opacity: 0.8;
                        color: ${colors.orange} !important;
                    }
                `}} />
            </footer>
            

            {/* SECTIONS CSS SECURISEE */}
            <style dangerouslySetInnerHTML={{ __html: `
                .fade {
                    opacity: 0;
                    transform: translateY(32px);
                    transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .fade.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .premium-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .premium-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
                }
                .card-feature:hover {
                    transform: translateY(-5px);
                    border-color: #E97223 !important;
                }
                [data-bs-theme="dark"] .premium-card {
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
                }
                [data-bs-theme="dark"] .text-adaptive {
                    color: rgba(255, 255, 255, 0.85) !important;
                }
                [data-bs-theme="dark"] .badge-adaptive {
                    background-color: rgba(25, 135, 84, 0.25) !important;
                    color: #4dfd96 !important;
                }
            `}} />
        </div>
    );
};

// --- SOUS COMPOSANTS ASSOCIES ---

const Section = ({ title, text, img, colors, reverse = false }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className={`row align-items-center g-4 g-lg-5 ${reverse ? 'flex-lg-row-reverse' : ''}`}>
                <div className="col-lg-6">
                    <h2 className="fw-bold mb-3" style={{ color: colors.darkGreen }}>{title}</h2>
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
            <h2 className="text-center fw-bold mb-4" style={{ color: colors.darkGreen }}>Le constat &amp; notre réponse</h2>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-danger" style={cardStyle}>
                        <img src={probleme} alt="" className="mb-3" style={{ width: 48, height: 48 }} />
                        <h5 className="text-danger fw-bold mb-2">Les difficultés rencontrées</h5>
                        <ul className="mb-0 ps-3 opacity-75 text-adaptive">
                            <li>Données financières dispersées (cahiers, fichiers, outils isolés)</li>
                            <li>Manque de visibilité sur les dépenses par catégorie</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-success" style={cardStyle}>
                        <img src={solution1} alt="" className="mb-3" style={{ width: 48, height: 48 }} />
                        <h5 className="text-success fw-bold mb-2">La réponse DjagoYelen</h5>
                        <ul className="mb-0 ps-3 opacity-75 text-adaptive">
                            <li>Plateforme unique pour piloter finances, budgets et factures</li>
                            <li>Tableaux de bord et rapports pour une lecture immédiate</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const VALUES = [
    {
        title: 'Clarté',
        desc: 'Des interfaces lisibles et des données présentées de façon compréhensible.',
    },
    {
        title: 'Fiabilité',
        desc: 'Une base technique stable, avec authentification sécurisée et sauvegarde des données.',
    },
    {
        title: 'Proximité',
        desc: 'Une solution pensée pour les réalités économiques et opérationnelles locales.',
    },
    {
        title: 'Évolution',
        desc: 'Une plateforme qui s\'enrichit progressivement selon les retours des utilisateurs.',
    },
];

const Values = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-4" style={{ color: colors.darkGreen }}>
                Nos valeurs
            </h2>
            <div className="row g-3">
                {VALUES.map((v) => (
                    <div key={v.title} className="col-sm-6 col-lg-3">
                        <div
                            className="p-4 rounded-4 shadow-sm h-100 premium-card text-center text-sm-start"
                            style={cardStyle}
                        >
                            <h6 className="fw-bold mb-2" style={{ color: colors.orange }}>
                                {v.title}
                            </h6>
                            <p className="small mb-0 opacity-75 text-adaptive">{v.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const WhyUs = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();

    const points = [
        { icon: 'shield-check', label: 'Connexion sécurisée et espace personnel protégé' },
        { icon: 'phone', label: 'Interface adaptée au mobile comme au bureau' },
        { icon: 'graph-up-arrow', label: 'Indicateurs pour piloter, pas seulement enregistrer' },
        { icon: 'globe2', label: 'Conçu pour le contexte ouest-africain (FCFA, usages locales)' },
    ];

    return (
        <section
            box-id="why-us"
            ref={ref}
            className={`mb-5 fade ${visible ? 'show' : ''} p-4 p-md-5 rounded-4 text-white`}
            style={{ backgroundColor: colors.darkGreen }}
        >
            <h2 className="fw-bold text-center mb-4">Pourquoi choisir DjagoYelen ?</h2>
            <div className="row g-3">
                {points.map((p) => (
                    <div key={p.label} className="col-md-6">
                        <div className="d-flex align-items-start gap-3">
                            <i className={`bi bi-${p.icon} fs-4`} style={{ color: colors.orange }} />
                            <p className="mb-0 opacity-90" style={{ lineHeight: 1.6 }}>
                                {p.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CTA = ({ colors }) => {
    const navigate = useNavigate();
    return (
        <section className="py-5 px-4 mb-5 text-center rounded-4 text-white" style={{ backgroundColor: colors.darkGreen }}>
            <h3 className="fw-bold mb-2">Prêt à structurer vos finances ?</h3>
            <p className="text-white mb-4 col-lg-6 mx-auto text-adaptive">
                Accédez à votre tableau de bord et commencez à suivre vos opérations dès
                aujourd&apos;hui.
            </p>
            <button type="button" className="btn px-4 py-2 mt-3 fw-semibold text-white shadow-sm" style={{ backgroundColor: colors.orange, borderRadius: '8px' }} onClick={() => navigate('/dashboard')}>
                Accéder au tableau de bord
            </button>
        </section>
    );
};

export default Public;