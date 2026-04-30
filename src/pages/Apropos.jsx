import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
// Importations corrigées pour Vite
import img2 from '../assets/img2.png';
import probleme from '../assets/probleme.svg';
import solution from '../assets/solution.svg';
import solution1 from '../assets/solution1.png';

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

    const [heroRef, heroVisible] = useScrollAnimation();

    return (
        <div className="container-fluid px-0 px-md-5 py-5">
            {/* HERO */}
            <section ref={heroRef} className={`fade ${heroVisible ? 'show' : ''}`}>
                <div className="mb-5" style={{ textAlign: 'justify' }}>
                    <h1 className="display-3 fw-bold">
                        <span style={{ color: colors.darkGreen }}>Djago</span> 
                        <span style={{ color: colors.orange }}>Yelen</span>
                    </h1>

                    <p className="lead col-md-7 mx-auto opacity-75" style={{ fontSize: '1.25rem', textAlign: 'justify' }}>
                        Une plateforme intelligente de gestion financière conçue pour moderniser les PME africaines. 
                        Libérez le potentiel de votre entreprise grâce à notre plateforme. 
                        Elle transforme vos données comptables en décisions stratégiques claires, accessibles en quelques clics.
                        <span className="fw-bold"> Clarté, performance et croissance au bout des doigts.</span>
                    </p>

                    <img
                        src={img2}
                        className="img-fluid shadow-lg mt-0"
                        style={{ maxHeight: '500px', objectFit: 'cover', width: '100%' }}
                        alt="DjagoYelen Interface"
                    />
                </div>
            </section>

            {/* VISION */}
            <Section
                title="Notre Vision"
                img={img2}
                text="DjagoYelen vise à transformer la gestion financière en Afrique en apportant clarté, transparence et performance aux entreprises."
                colors={colors}
            />

            <ProblemSolution colors={colors} cardStyle={cardStyle} />
            <Features colors={colors} cardStyle={cardStyle} />
            <Values colors={colors} cardStyle={cardStyle} />
            <Impact colors={colors} />
            <Roadmap colors={colors} />
            <Team colors={colors} cardStyle={cardStyle} />
            <CTA colors={colors} />

            <style>{`
                .fade { opacity: 0; transform: translateY(50px) scale(0.98); filter: blur(6px); transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
                .fade.show { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
                .glass { backdrop-filter: blur(12px); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
                .premium-card { transition: all 0.4s ease; cursor: pointer; }
                .premium-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            `}</style>
        </div>
    );
};

/* COMPOSANTS DE SECTION */
const Section = ({ title, text, img, colors }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className="row align-items-center g-5">
                <div className="col-lg-6">
                    <h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>{title}</h2>
                    <p className="fs-5">{text}</p>
                </div>
                <div className="col-lg-6">
                    <img src={img} className="img-fluid rounded-4 shadow" alt="" />
                </div>
            </div>
        </section>
    );
};

const ProblemSolution = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className="row g-4">
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow border-start border-danger border-4 glass premium-card" style={cardStyle}>
                        <img src={probleme} alt="Problème" className="mb-3" style={{ width: '40px', height: '40px' }} />
                        <h5 className="text-danger fw-bold">Problème</h5>
                        <p>Les entreprises utilisent encore des outils dispersés et inefficaces.</p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-4 rounded-4 shadow border-start border-success border-4 glass premium-card" style={cardStyle}>
                        <img src={solution1} alt="Solution" className="mb-3" style={{ width: '40px', height: '40px' }} />
                        <h5 className="text-success fw-bold">Solution</h5>
                        <p>Une plateforme centralisée pour une gestion intelligente et moderne.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ... Reste des composants (Features, Values, etc.) identiques à votre version ... */
const Features = ({ colors, cardStyle }) => (
    <section className="mb-5">
        <h2 className="text-center fw-bold mb-5" style={{ color: colors.darkGreen }}>Fonctionnalités</h2>
        <div className="row g-4">{["Gestion clients", "Suivi financier", "Automatisation"].map((f, i) => <FeatureCard key={i} f={f} i={i} cardStyle={cardStyle} />)}</div>
    </section>
);

const FeatureCard = ({ f, i, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <div ref={ref} className={`col-md-4 fade ${visible ? 'show' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
            <div className="p-4 rounded-4 shadow text-center h-100 glass premium-card" style={cardStyle}><h5 className="fw-bold">{f}</h5></div>
        </div>
    );
};

const Values = ({ colors, cardStyle }) => (
    <section className="mb-5">
        <h2 className="text-center fw-bold mb-5" style={{ color: colors.darkGreen }}>Nos Valeurs</h2>
        <div className="row g-4">{["Innovation", "Transparence", "Performance", "Fiabilité"].map((v, i) => (
            <div key={i} className="col-md-3 fade show"><div className="p-4 text-center rounded-4 glass premium-card" style={cardStyle}><h6 className="fw-bold">{v}</h6></div></div>
        ))}</div>
    </section>
);

const Impact = ({ colors }) => (
    <section className="mb-5 text-center p-5 rounded-5 text-white glass" style={{ backgroundColor: colors.darkGreen }}>
        <h2 className="fw-bold mb-4">Impact</h2>
        <div className="row">{[{v:"+70%", l:"Productivité"}, {v:"-50%", l:"Erreurs"}, {v:"24/7", l:"Disponibilité"}, {v:"+100%", l:"Visibilité"}].map((stat, i) => (
            <div key={i} className="col-md-3"><h3>{stat.v}</h3><p>{stat.l}</p></div>
        ))}</div>
    </section>
);

const Roadmap = ({ colors }) => (
    <section className="mb-5 text-center"><h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>Roadmap</h2>{["MVP", "Mobile", "IA", "Expansion"].map((s, i) => <p key={i} className="fade show">{s}</p>)}</section>
);

const Team = ({ colors, cardStyle }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`text-center mb-5 fade ${visible ? 'show' : ''}`}>
            <h2 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>Équipe</h2>
            <div className="p-5 rounded-4 glass premium-card" style={cardStyle}><h4>Karim Sanou</h4><p>Développeur Fullstack</p></div>
        </section>
    );
};

const CTA = ({ colors }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`text-center fade ${visible ? 'show' : ''}`}>
            <h3 className="fw-bold mb-3">Commencer maintenant</h3>
            <button className="btn px-4 py-2 fw-bold" style={{ backgroundColor: colors.orange, color: 'white', borderRadius: '30px' }}>Lancer</button>
        </section>
    );
};

export default AproposDetails;