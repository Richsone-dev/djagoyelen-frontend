import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import ThemeProvider from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { CategoryProvider } from './context/CategoryContext.jsx';
import { EntrepriseProvider } from './context/EntrepriseContext.jsx';

// 1. Importation de React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importation du script d'enregistrement automatique de la PWA
import { registerSW } from 'virtual:pwa-register'; //  Bon chemin virtuel !

// Activation immédiate du service worker en arrière-plan
registerSW({ immediate: true });

// 2. Création de l'instance du client de cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Les données restent "fraîches" pendant 5 minutes en cache
      refetchOnWindowFocus: false, // Évite de recharger dès qu'on change d'onglet de navigateur
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <CategoryProvider>
          <EntrepriseProvider>
          {/* 3. Enveloppement de l'application avec le Provider de cache */}
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
          </EntrepriseProvider>
        </CategoryProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)