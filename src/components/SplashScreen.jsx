import React from 'react';
import logo from '../assets/djago-logo.jpeg';

const SplashScreen = () => {
    // Couleurs officielles de ton projet
    const colors = {
        darkGreen: '#0A3B2F',
        successGreen: '#198754',
        orange: '#E97223',
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={styles.container(colors.darkGreen)}>
            {/* Injection des animations CSS */}
            <style>{styles.keyframes}</style>
            
            <div style={styles.logoWrapper}>
                <img 
                    src={logo} 
                    alt="DjagoYelen Logo" 
                    style={styles.logo} 
                />
            </div>
            
            <h2 className="fw-bold mt-4" style={styles.title}>
                <span style={{ color: colors.successGreen }}>Djago</span>
                <span style={{ color: colors.orange }}>Yelen</span>
            </h2>
            
            <div className="mt-3" style={styles.spinner(colors.orange)}></div>
        </div>
    );
};

const styles = {
    container: (bgColor) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: bgColor,
        zIndex: 9999,
        transition: 'opacity 0.5s ease-out',
    }),
    logoWrapper: {
        animation: 'pulseScale 2s infinite ease-in-out',
    },
    logo: {
        width: '100px',
        height: '100px',
        borderRadius: '24px',
        objectFit: 'cover',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    },
    title: {
        fontSize: '2.2rem',
        letterSpacing: '1px',
        animation: 'fadeInText 1.2s ease-out forwards',
        opacity: 0,
    },
    spinner: (color) => ({
        width: '40px',
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
    }),
    keyframes: `
        @keyframes pulseScale {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; box-shadow: 0 15px 35px rgba(25, 135, 84, 0.4); }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes fadeInText {
            0% { transform: translateY(10px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
    `
};

export default SplashScreen;