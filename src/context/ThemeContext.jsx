import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Couleurs globales accessibles partout
    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        bgLight: theme === 'light' ? '#F8F9FA' : '#121212',
        cardBg: theme === 'light' ? '#ffffff' : '#1e1e1e',
        textColor: theme === 'light' ? '#212529' : '#f8f9fa',
        inputBg: theme === 'dark' ? '#2b2b2b' : '#f8f9fa'
    };

    useEffect(() => {
        // Applique l'attribut Bootstrap au HTML
        document.documentElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Optionnel : Change aussi le body pour éviter les flashs blancs au scroll
        document.body.style.backgroundColor = colors.bgLight;
        document.body.style.color = colors.textColor;
    }, [theme, colors.bgLight, colors.textColor]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;