import axios from 'axios';

const api = axios.create({
    // L'URL de ton serveur Laravel (Backend)
    baseURL: import.meta.env.VITE_APP_API_URL, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Ce bloc permet d'ajouter automatiquement le token s'il existe dans le navigateur
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;