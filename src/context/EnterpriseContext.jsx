import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const EnterpriseContext = createContext();

export const EnterpriseProvider = ({ children }) => {
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

    useEffect(() => {
        if (!entreprise?.logo) {
            return undefined;
        }

        let objectUrl;
        api.get('/entreprise/logo', { responseType: 'blob' })
            .then((response) => {
                objectUrl = URL.createObjectURL(response.data);
                setLogoObjectUrl(objectUrl);
            })
            .catch(() => setLogoObjectUrl(null));

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [entreprise?.logo]);

    const buildFormData = (payload, logoFile) => {
        const data = new FormData();
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
        const response = await api.put('/entreprise', buildFormData(payload, logoFile), {
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
        <EnterpriseContext.Provider value={value}>
            {children}
        </EnterpriseContext.Provider>
    );
};

export const useEnterprise = () => {
    const context = useContext(EnterpriseContext);
    if (!context) {
        throw new Error('useEnterprise doit être utilisé avec EnterpriseProvider');
    }
    return context;
};

export default EnterpriseContext;
