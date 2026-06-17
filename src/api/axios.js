import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api';
//const baseURL ='http://localhost:8000/api';
const api = axios.create({
    baseURL,
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