import api from '../api/axios';

const API_ORIGIN =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ||
    import.meta.env.VITE_APP_API_URL?.replace(/\/api\/?$/, '') ||
    'http://localhost:8000';

export const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
});

/** Charge le logo entreprise via l'API (évite CORS sur /uploads) */
export const loadEnterpriseLogoAsDataUrl = async () => {
    const response = await api.get('/entreprise/logo', { responseType: 'blob' });
    return blobToDataUrl(response.data);
};

export default getMediaUrl;
