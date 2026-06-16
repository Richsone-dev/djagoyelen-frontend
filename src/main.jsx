import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import ThemeProvider from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';

// Importation du script d'enregistrement automatique de la PWA
import { registerSW } from 'virtual:pwa-register'; //  Bon chemin virtuel !

// Activation immédiate du service worker en arrière-plan
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)