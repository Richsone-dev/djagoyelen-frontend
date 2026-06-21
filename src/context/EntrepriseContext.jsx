import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const EntrepriseContext = createContext();

export const EntrepriseProvider = ({ children }) => {
    const [entreprise, setEntreprise] = useState(null);
    const [logoObjectUrl, setLogoObjectUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEntreprise = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setEntreprise(null);
            setLoading(false);
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/entreprise');
            const data = response.data.data || response.data;
            setEntreprise(data);
            return data;
        } catch (err) {
            if (err.response?.status === 404) {
                setEntreprise(null);
                setLogoObjectUrl(null);
                return null;
            }
            setError(err.response?.data?.message || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntreprise();
    }, [fetchEntreprise]);

    // Gestion optimisée et sécurisée du téléchargement du logo binaire
    useEffect(() => {
        if (!entreprise?.logo) {
            setLogoObjectUrl(null);
            return undefined;
        }

        let isMounted = true;
        let objectUrl = null;

        api.get('/entreprise/logo', { responseType: 'blob' })
            .then((response) => {
                if (isMounted) {
                    objectUrl = URL.createObjectURL(response.data);
                    setLogoObjectUrl(objectUrl);
                }
            })
            .catch((err) => {
                console.error("Erreur lors de la récupération du logo binaire :", err);
                if (isMounted) setLogoObjectUrl(null);
            });

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [entreprise?.logo]); // S'exécute uniquement si la chaîne ou le chemin du logo change réellement

    // Générateur automatique de FormData avec support du Method Spoofing pour Laravel
    const buildFormData = (payload, logoFile, method = null) => {
        const data = new FormData();
        
        if (method) {
            data.append('_method', method);
        }

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                data.append(key, value);
            }
        });

        if (logoFile) {
            data.append('logo', logoFile);
        }
        return data;
    };

    const createEntreprise = useCallback(async (payload, logoFile = null) => {
        const response = await api.post('/entreprise', buildFormData(payload, logoFile), {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data = response.data.data || response.data;
        setEntreprise(data);
        return data;
    }, []);

    const updateEntreprise = useCallback(async (payload, logoFile = null) => {
        // Envoi en POST à axios + simulation du PUT avec '_method' pour contourner le problème multipart de PHP
        const response = await api.post('/entreprise', buildFormData(payload, logoFile, 'PUT'), {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        const result = response.data.data || response.data;
        setEntreprise(result);
        return result;
    }, []);

    const deleteEntreprise = useCallback(async () => {
        await api.delete('/entreprise');
        setEntreprise(null);
        setLogoObjectUrl(null);
    }, []);

    const logoUrl = logoObjectUrl;

    const value = {
        entreprise,
        logoUrl,
        loading,
        error,
        fetchEntreprise,
        createEntreprise,
        updateEntreprise,
        deleteEntreprise,
        hasEntreprise: !!entreprise,
    };

    return (
        <EntrepriseContext.Provider value={value}>
            {children}
        </EntrepriseContext.Provider>
    );
};

export const useEntreprise = () => {
    const context = useContext(EntrepriseContext);
    if (!context) {
        throw new Error('useEntreprise doit être utilisé avec EntrepriseProvider');
    }
    return context;
};

export default EntrepriseContext;