import axios from 'axios';

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:8000/api',
        baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            if (!window.location.hash.includes('/admin/login')) {
                window.location.hash = '#/admin/login';
            }
        }
        return Promise.reject(error);
    }
);

export default adminApi;
