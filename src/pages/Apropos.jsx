import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/* HOOK SCROLL ANIMATION */
const useScrollAnimation = () => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.2 }
        );
        const current = ref.current;
        if (current) observer.observe(current);
        return () => { if (current) observer.unobserve(current); };
    }, []);
    return [ref, visible];
};

const AproposDetails = () => {
    const { colors } = useTheme();
    const cardStyle = { backgroundColor: colors.cardBg, color: colors.textColor, border: 'none' };
    const [heroRef, heroVisible] = useScrollAnimation();
    
    // Chemin direct vers le dossier public
    const imgPath = "/assets/img2.png"; 

    return (
        <div className="container-fluid px-3 px-md-5 py-5">
            {/* HERO */}
            <section ref={heroRef} className={`fade ${heroVisible ? 'show' : ''}`}>
                <div className="text-center mb-5">
                    <h1 className="display-3 fw-bold" style={{ color: colors.darkGreen }}>DjagoYelen</h1>
                    <p className="lead col-md-7 mx-auto opacity-75">
                        Une plateforme intelligente de gestion financière conçue pour moderniser les PME africaines. 
                        Transformez vos données en décisions stratégiques.
                    </p>
                    <img src={imgPath} className="img-fluid rounded-5 shadow-lg mt-4" style={{ maxHeight: '420px', objectFit: 'cover' }} alt="DjagoYelen" />
                </div>
            </section>

            {/* SECTIONS */}
            <Section title="Notre Vision" img={imgPath} text="Apporter clarté et performance aux PME." colors={colors} />
            <ProblemSolution colors={colors} cardStyle={cardStyle} />
            <Features colors={colors} cardStyle={cardStyle} />
            <Values colors={colors} cardStyle={cardStyle} />
            <Team colors={colors} cardStyle={cardStyle} />
            <CTA colors={colors} />

            <style>{`
                .fade { opacity: 0; transform: translateY(50px); transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
                .fade.show { opacity: 1; transform: translateY(0); }
                .glass { backdrop-filter: blur(12px); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
                .premium-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            `}</style>
        </div>
    );
};

/* COMPOSANTS SECONDAIRES */
const Section = ({ title, text, img, colors }) => {
    const [ref, visible] = useScrollAnimation();
    return (
        <section ref={ref} className={`mb-5 fade ${visible ? 'show' : ''}`}>
            <div className="row align-items-center g-5">
                <div className="col-lg-6">
                    <h2 className="fw-bold" style={{ color: colors.darkGreen }}>{title}</h2>
                    <p className="fs-5">{text}</p>
                </div>
                <div className="col-lg-6"><img src={img} className="img-fluid rounded-4 shadow" alt="" /></div>
            </div>
        </section>
    );
};

const ProblemSolution = ({ colors, cardStyle }) => (
    <div className="row g-4 mb-5">
        <div className="col-md-6"><div className="p-4 rounded-4 shadow border-start border-danger border-4 glass" style={cardStyle}><h5>Problème</h5><p>Outils dispersés.</p></div></div>
        <div className="col-md-6"><div className="p-4 rounded-4 shadow border-start border-success border-4 glass" style={cardStyle}><h5>Solution</h5><p>Plateforme centralisée.</p></div></div>
    </div>
);

const Features = ({ colors, cardStyle }) => (
    <section className="mb-5">
        <h2 className="text-center fw-bold mb-5" style={{ color: colors.darkGreen }}>Fonctionnalités</h2>
        <div className="row g-4">
            {["Gestion", "Suivi", "IA"].map((f, i) => (
                <div key={i} className="col-md-4"><div className="p-4 rounded-4 shadow text-center glass" style={cardStyle}><h5>{f}</h5></div></div>
            ))}
        </div>
    </section>
);

const Values = ({ colors, cardStyle }) => (
    <div className="row g-4 mb-5 text-center">
        {["Innovation", "Transparence", "Performance"].map((v, i) => (
            <div key={i} className="col-md-4"><div className="p-4 rounded-4 glass" style={cardStyle}><h6>{v}</h6></div></div>
        ))}
    </div>
);

const Team = ({ colors, cardStyle }) => (
    <div className="text-center mb-5 p-5 rounded-4 glass" style={cardStyle}>
        <h4>Karim Sanou</h4><p>Développeur Fullstack</p>
    </div>
);

const CTA = ({ colors }) => (
    <div className="text-center pb-5">
        <button className="btn px-4 py-2 fw-bold" style={{ backgroundColor: colors.orange, color: 'white', borderRadius: '30px' }}>Lancer</button>
    </div>
);

export default AproposDetails;