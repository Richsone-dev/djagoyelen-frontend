import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import img2 from '../assets/img2.png';
import probleme from '../assets/probleme.svg';
import solution1 from '../assets/solution1.png';
import karimProfil from '../assets/karimProfil.jpeg';
import francoiseProfil from '../assets/francoiseProfil.jpeg';
import visuel2 from '../assets/visuel2.jpeg';
import visuel3 from '../assets/visuel3.jpeg';

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

const AproposDetails = () => {
    const { colors } = useTheme();
    const cardStyle = {
        backgroundColor: colors.cardBg,
        color: colors.textColor,
        border: 'none',
    };

    const [heroRef, heroVisible] = useScrollAnimation();

    return (
        <div className="container-fluid px-2 px-md-4 py-4 pb-5">
            {/* Hero */}
            <section ref={heroRef} className={`fade ${heroVisible ? 'show' : ''}`}>
                <div
                    className="mb-5 text-center p-4 p-md-5 rounded-4 shadow-sm"
                    style={{ backgroundColor: colors.cardBg }}
                >
                    <p
                        className="text-uppercase small fw-semibold mb-2"
                        style={{ color: colors.orange, letterSpacing: '0.12em' }}
                    >
                        À propos de nous
                    </p>
                    <h1 className="display-5 fw-bold mb-3">
                        <span style={{ color: colors.darkGreen }}>Djago</span>
                        <span style={{ color: colors.orange }}>Yelen</span>
                    </h1>
                    <p
                        className="lead col-lg-9 mx-auto mb-4 opacity-75"
                        style={{ lineHeight: 1.7 }}
                    >
                        DjagoYelen est une solution numérique de gestion financière conçue pour
                        les entrepreneurs, les PME et les structures en activité en Afrique de
                        l&apos;Ouest. Notre objectif : centraliser vos opérations, clarifier vos
                        indicateurs et faciliter vos décisions au quotidien.
                    </p>
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                        {['Transactions', 'Budgets', 'Facturation', 'Rapports'].map((tag) => (
                            <span
                                key={tag}
                                className="badge rounded-pill px-3 py-2"
                                style={{
                                    backgroundColor: 'rgba(25, 135, 84, 0.12)',
                                    color: colors.darkGreen,
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <img
                        src={img2}
                        className="img-fluid shadow rounded-4"
                        style={{ maxHeight: 320, objectFit: 'cover', width: '100%' }}
                        alt="Interface DjagoYelen"
                    />
                </div>
            </section>

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

            <ProblemSolution colors={colors} cardStyle={cardStyle} />
            <Features colors={colors} cardStyle={cardStyle} />
            <Values colors={colors} cardStyle={cardStyle} />
            <WhyUs colors={colors} />
            <Roadmap colors={colors} cardStyle={cardStyle} />
            <Team colors={colors} cardStyle={cardStyle} />
            <CTA colors={colors} />

            <style>{`
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
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .premium-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
                }
            `}</style>
        </div>
    );
};

const Section = ({ title, text, img, colors, reverse = false }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div
                className={`row align-items-center g-4 g-lg-5 ${
                    reverse ? 'flex-lg-row-reverse' : ''
                }`}
            >
                <div className="col-lg-6">
                    <h2 className="fw-bold mb-3" style={{ color: colors.darkGreen }}>
                        {title}
                    </h2>
                    <p className="mb-0 opacity-75" style={{ lineHeight: 1.75, fontSize: '1.05rem' }}>
                        {text}
                    </p>
                </div>
                <div className="col-lg-6">
                    <img
                        src={img}
                        className="img-fluid rounded-4 shadow"
                        alt={title}
                        style={{ objectFit: 'cover', maxHeight: 280, width: '100%' }}
                    />
                </div>
            </div>
        </section>
    );
};

const ProblemSolution = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-4" style={{ color: colors.darkGreen }}>
                Le constat &amp; notre réponse
            </h2>
            <div className="row g-4">
                <div className="col-md-6">
                    <div
                        className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-danger"
                        style={cardStyle}
                    >
                        <img
                            src={probleme}
                            alt=""
                            className="mb-3"
                            style={{ width: 48, height: 48 }}
                        />
                        <h5 className="text-danger fw-bold mb-2">Les difficultés rencontrées</h5>
                        <ul className="mb-0 ps-3 opacity-75" style={{ lineHeight: 1.7 }}>
                            <li>Données financières dispersées (cahiers, fichiers, outils isolés)</li>
                            <li>Manque de visibilité sur les dépenses par catégorie</li>
                            <li>Facturation et suivi clients peu structurés</li>
                            <li>Décisions prises sans indicateurs fiables en temps réel</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div
                        className="p-4 rounded-4 shadow-sm h-100 premium-card border-start border-4 border-success"
                        style={cardStyle}
                    >
                        <img
                            src={solution1}
                            alt=""
                            className="mb-3"
                            style={{ width: 48, height: 48 }}
                        />
                        <h5 className="text-success fw-bold mb-2">La réponse DjagoYelen</h5>
                        <ul className="mb-0 ps-3 opacity-75" style={{ lineHeight: 1.7 }}>
                            <li>Plateforme unique pour piloter finances, budgets et factures</li>
                            <li>Tableaux de bord et rapports pour une lecture immédiate</li>
                            <li>Alertes et notifications sur l&apos;évolution des budgets</li>
                            <li>Accès sécurisé, disponible sur le web, où que vous soyez</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

const FEATURES = [
    {
        icon: 'cash-stack',
        title: 'Transactions',
        desc: 'Enregistrez revenus et dépenses, classez-les par catégorie et consultez l\'historique complet.',
    },
    {
        icon: 'piggy-bank',
        title: 'Budgets',
        desc: 'Définissez des plafonds par période et suivez votre consommation avec des alertes automatiques.',
    },
    {
        icon: 'receipt',
        title: 'Facturation',
        desc: 'Créez des factures professionnelles, gérez vos clients et exportez vos documents en PDF.',
    },
    {
        icon: 'file-earmark-bar-graph',
        title: 'Rapports',
        desc: 'Visualisez vos performances financières grâce à des synthèses et graphiques clairs.',
    },
    {
        icon: 'people',
        title: 'Clients',
        desc: 'Centralisez les coordonnées et l\'historique de vos relations commerciales.',
    },
    {
        icon: 'bell',
        title: 'Notifications',
        desc: 'Recevez des alertes utiles pour ne pas dépasser vos budgets et rester informé.',
    },
];

const Features = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-2" style={{ color: colors.darkGreen }}>
                Fonctionnalités principales
            </h2>
            <p className="text-center text-muted mb-4 col-lg-8 mx-auto">
                Des modules pensés pour couvrir l&apos;essentiel de la gestion financière
                d&apos;une activité moderne.
            </p>
            <div className="row g-3 g-md-4">
                {FEATURES.map((f, i) => (
                    <FeatureCard key={f.title} f={f} i={i} cardStyle={cardStyle} colors={colors} />
                ))}
            </div>
        </section>
    );
};

const FeatureCard = ({ f, i, cardStyle, colors }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <div
            ref={ref}
            className={`col-sm-6 col-lg-4 fade ${visible ? 'show' : ''}`}
            style={{ transitionDelay: `${i * 0.08}s` }}
        >
            <div className="p-4 rounded-4 shadow-sm h-100 premium-card text-start" style={cardStyle}>
                <div
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(25, 135, 84, 0.12)',
                    }}
                >
                    <i className={`bi bi-${f.icon} fs-5`} style={{ color: colors.successGreen }} />
                </div>
                <h5 className="fw-bold mb-2">{f.title}</h5>
                <p className="small mb-0 opacity-75" style={{ lineHeight: 1.6 }}>
                    {f.desc}
                </p>
            </div>
        </div>
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
                            <p className="small mb-0 opacity-75">{v.desc}</p>
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
        { icon: 'globe2', label: 'Conçu pour le contexte ouest-africain (FCFA, usages locaux)' },
    ];

    return (
        <section
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

const ROADMAP = [
    { phase: '2025 — Lancement', items: ['Gestion des transactions et catégories', 'Budgets et alertes', 'Facturation et clients'] },
    { phase: '2026 — Consolidation', items: ['Rapports avancés', 'Notifications intelligentes', 'Espace administration'] },
    { phase: 'À venir', items: ['Application mobile dédiée', 'Exports comptables', 'Multi-devises et intégrations'] },
];

const Roadmap = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="text-center fw-bold mb-4" style={{ color: colors.darkGreen }}>
                Feuille de route
            </h2>
            <div className="row g-3">
                {ROADMAP.map((step) => (
                    <div key={step.phase} className="col-md-4">
                        <div className="p-4 rounded-4 shadow-sm h-100 premium-card" style={cardStyle}>
                            <h6 className="fw-bold mb-3" style={{ color: colors.orange }}>
                                {step.phase}
                            </h6>
                            <ul className="small mb-0 ps-3 opacity-75" style={{ lineHeight: 1.8 }}>
                                {step.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Team = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    const teamMembers = [
        {
            name: 'Karim SANOU',
            title: 'Ingénieur — Développement Full Stack',
            img: karimProfil,
            profil: 'Conception et développement de la plateforme DjagoYelen : architecture backend, API, interface utilisateur et déploiement cloud.',
        },
        {
            name: 'Françoise Jessica SOW',
            title: 'Ingénieure — Développement Full Stack',
            img: francoiseProfil,
            profil: 'Co-conception technique, intégration des modules métier et amélioration continue de l\'expérience utilisateur.',
        },
    ];

    return (
        <section ref={ref} className={`text-center mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="fw-bold mb-2" style={{ color: colors.darkGreen }}>
                L&apos;équipe projet
            </h2>
            <p className="text-muted mb-4 col-lg-7 mx-auto">
                DjagoYelen est porté par une équipe d&apos;ingénieurs en génie logiciel,
                engagés pour des solutions numériques utiles et durables.
            </p>
            <div className="row g-4 justify-content-center">
                {teamMembers.map((member) => (
                    <div key={member.name} className="col-12 col-md-6 col-lg-5">
                        <div
                            className="p-4 rounded-4 shadow-sm h-100 premium-card"
                            style={cardStyle}
                        >
                            <img
                                src={member.img}
                                alt={member.name}
                                className="rounded-circle shadow-sm border border-3 mb-3"
                                style={{
                                    width: 130,
                                    height: 130,
                                    objectFit: 'cover',
                                    borderColor: colors.orange,
                                }}
                            />
                            <h5 className="fw-bold mb-1">{member.name}</h5>
                            <p
                                className="text-uppercase small mb-3"
                                style={{ color: colors.orange, letterSpacing: '0.08em' }}
                            >
                                {member.title}
                            </p>
                            <p className="small mb-0 opacity-75" style={{ lineHeight: 1.65 }}>
                                {member.profil}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const CTA = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();
    const navigate = useNavigate();

    return (
        <section
            ref={ref}
            className={`py-5 px-4 text-center rounded-4 fade ${visible ? 'show' : ''}`}
            style={{ backgroundColor: 'rgba(233, 114, 35, 0.08)' }}
        >
            <h3 className="fw-bold mb-2" style={{ color: colors.darkGreen }}>
                Prêt à structurer vos finances ?
            </h3>
            <p className="text-muted mb-4 col-lg-6 mx-auto">
                Accédez à votre tableau de bord et commencez à suivre vos opérations dès
                aujourd&apos;hui.
            </p>
            <button
                type="button"
                className="btn px-4 py-2 fw-semibold text-white shadow-sm"
                style={{ backgroundColor: colors.orange, borderRadius: '8px' }}
                onClick={() => navigate('/dashboard')}
            >
                Accéder au tableau de bord
            </button>
        </section>
    );
};

export default AproposDetails;
