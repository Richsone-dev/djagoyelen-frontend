import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import img2 from '../assets/img2.png';

/* HOOK SCROLL ANIMATION */
const useScrollAnimation = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setVisible(true);
            },
            { threshold: 0.2 }
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
        border: 'none'
    };
    
    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754'
    };

    const [heroRef, heroVisible] = useScrollAnimation();

    return (
        <div className="container-fluid px-0 px-md-5 py-5">

            {/* HERO */}
            <section ref={heroRef} className={`fade ${heroVisible ? 'show' : ''}`}>
                <div className=" mb-5" style={{ textAlign: 'justify'}}>

                    <h1 className="display-3 fw-bold" >
                       <span style={{ color: colors.darkGreen }}>Djago</span> <span style={{color: colors.orange}}>Yelen</span>
                    </h1>

                    <p className="lead col-md-7 mx-auto opacity-75" style={{ fontSize: '1.25rem', textAlign: 'justify' }}>
                        Une plateforme intelligente de gestion financière conçue pour moderniser les PME africaines. Libérez le potentiel de votre entreprise grâce à notre plateforme intelligente. Conçue spécifiquement pour les PME africaines, elle transforme vos données comptables en décisions stratégiques claires, accessibles en quelques clics, partout et tout le temps.
                        <span className="fw-bold"> Clarté, performance et croissance au bout des doigts.</span>
                    </p>

                    <img
                        src={img2}
                        className="img-fluid shadow-lg mt-0"
                        style={{ maxHeight: '500px', objectFit: 'cover' }}
                        alt="Visuel 1 représentant la plateforme DjagoYelen, avec des éléments graphiques modernes et dynamiques."
                    />
                </div>
            </section>

            {/* VISION */}
            <Section
                title="Notre Vision"
                img={img2}
                text="DjagoYelen vise à transformer la gestion financière en Afrique en apportant clarté, transparence et performance aux entreprises."
                colors={colors}
                textAlign="justify"
            />

            {/* PROBLEME / SOLUTION */}
            <ProblemSolution colors={colors} cardStyle={cardStyle} />

            {/* FEATURES */}
            <Features colors={colors} cardStyle={cardStyle} />

            {/* VALUES */}
            <Values colors={colors} cardStyle={cardStyle} />

            {/* IMPACT */}
            <Impact colors={colors} />

            {/* ROADMAP */}
            <Roadmap colors={colors} />

            {/* TEAM */}
            <Team colors={colors} cardStyle={cardStyle} />

            {/* CTA */}
            <CTA colors={colors} />

            {/* STYLE GLOBAL */}
            <style>{`
                .fade {
                    opacity: 0;
                    transform: translateY(50px) scale(0.98);
                    filter: blur(6px);
                    transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .fade.show {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    filter: blur(0);
                }

                .glass {
                    backdrop-filter: blur(12px);
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                }

                .premium-card {
                    transition: all 0.4s ease;
                    cursor: pointer;
                }

                .premium-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }
            `}</style>
        </div>
    );
};

/* SECTION */
const Section = ({ title, text, img, colors }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className="row align-items-center g-5">
                <div className="col-lg-6">
                    <h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                        {title}
                    </h2>
                    <p className="fs-5">{text}</p>
                </div>

                <div className="col-lg-6">
                    <img src={img} className="img-fluid rounded-4 shadow" alt="" />
                </div>
            </div>
        </section>
    );
};

/* PROBLEM / SOLUTION */
const ProblemSolution = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className="row g-4">

                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow border-start border-danger border-4 glass premium-card"
                        style={cardStyle}
                    >
                        <h5 className="text-danger fw-bold">Problème</h5>
                        <p>Les entreprises utilisent encore des outils dispersés et inefficaces.</p>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow border-start border-success border-4 glass premium-card"
                        style={cardStyle}
                    >
                        <h5 className="text-success fw-bold">Solution</h5>
                        <p>Une plateforme centralisée pour une gestion intelligente et moderne.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

/* FEATURES */
const Features = ({ colors, cardStyle }) => {
    const features = [
        "Gestion clients",
        "Suivi financier",
        "Automatisation",
        "Rapports avancés",
        "Notifications",
        "Sécurité"
    ];

    return (
        <section className="mb-5">
            <h2 className="text-center fw-bold mb-5" style={{ color: colors.darkGreen }}>
                Fonctionnalités
            </h2>

            <div className="row g-4">
                {features.map((f, i) => (
                    <FeatureCard key={i} f={f} i={i} cardStyle={cardStyle} />
                ))}
            </div>
        </section>
    );
};

const FeatureCard = ({ f, i, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <div
            ref={ref}
            className={`col-md-4 fade ${visible ? 'show' : ''}`}
            style={{ transitionDelay: `${i * 0.15}s` }}
        >
            <div className="p-4 rounded-4 shadow text-center h-100 glass premium-card"
                style={cardStyle}
            >
                <div className="mb-3">
                    <i className="bi bi-stars fs-3"></i>
                </div>

                <h5 className="fw-bold">{f}</h5>

                <p className="small opacity-75 mt-2">
                    {getFeatureDescription(f)}
                </p>
            </div>
        </div>
    );
};

const getFeatureDescription = (feature) => {
    const desc = {
        "Gestion clients": "Centralisation complète des clients.",
        "Suivi financier": "Analyse des flux en temps réel.",
        "Automatisation": "Réduction des tâches répétitives.",
        "Rapports avancés": "Rapports détaillés intelligents.",
        "Notifications": "Alertes automatiques.",
        "Sécurité": "Protection avancée des données."
    };

    return desc[feature] || "Fonctionnalité avancée.";
};

/* VALUES */
const Values = ({ colors, cardStyle }) => {
    const values = ["Innovation", "Transparence", "Performance", "Fiabilité"];

    return (
        <section className="mb-5">
            <h2 className="text-center fw-bold mb-5" style={{ color: colors.darkGreen }}>
                Nos Valeurs
            </h2>

            <div className="row g-4">
                {values.map((v, i) => {
                    const [ref, visible] = useScrollAnimation();

                    return (
                        <div key={i} ref={ref} className={`col-md-3 fade ${visible ? 'show' : ''}`}>
                            <div className="p-4 text-center rounded-4 glass premium-card"
                                style={cardStyle}
                            >
                                <h6 className="fw-bold">{v}</h6>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

/* IMPACT */
const Impact = ({ colors }) => (
    <section className="mb-5 text-center p-5 rounded-5 text-white glass"
        style={{ backgroundColor: colors.darkGreen }}
    >
        <h2 className="fw-bold mb-4">Impact</h2>

        <div className="row">
            <div className="col-md-3"><h3>+70%</h3><p>Productivité</p></div>
            <div className="col-md-3"><h3>-50%</h3><p>Erreurs</p></div>
            <div className="col-md-3"><h3>24/7</h3><p>Disponibilité</p></div>
            <div className="col-md-3"><h3>+100%</h3><p>Visibilité</p></div>
        </div>
    </section>
);

/* ROADMAP */
const Roadmap = ({ colors }) => {
    const steps = ["MVP", "Mobile", "IA", "Expansion"];

    return (
        <section className="mb-5 text-center" >
            <h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                Roadmap
            </h2>

            {steps.map((s, i) => (
                <p key={i} className="fade show">{s}</p>
            ))}
        </section>
    );
};

/* TEAM */
const Team = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`text-center mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                Équipe
            </h2>

            <div className="p-5 rounded-4 glass premium-card" style={cardStyle}>
                <h4>Karim Sanou</h4>
                <p>Développeur Fullstack</p>
            </div>
        </section>
    );
};

/* CTA */
const CTA = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();

    return (
        <section ref={ref} className={`text-center fade ${visible ? 'show' : ''}`}>
            <h3 className="fw-bold mb-3">Commencer maintenant</h3>

            <button
                className="btn px-4 py-2 fw-bold"
                style={{ backgroundColor: colors.orange, color: 'white', borderRadius: '30px' }}
            >
                Lancer
            </button>
        </section>
    );
};

export default AproposDetails;