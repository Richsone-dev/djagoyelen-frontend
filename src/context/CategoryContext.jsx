import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Charger les catégories au démarrage
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/categories');
            const data = Array.isArray(response.data) ? response.data : response.data.categories || [];
            setCategories(data);
        } catch (err) {
            console.error('Erreur lors du chargement des catégories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les catégories quand le provider monte
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCategories();
        } else {
            setLoading(false);
        }
    }, [fetchCategories]);

    // Ajouter une nouvelle catégorie
    const addCategory = useCallback(async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            const newCategory = response.data.category || response.data;
            setCategories(prev => [newCategory, ...prev]);
            return newCategory;
        } catch (err) {
            console.error('Erreur lors de la création de la catégorie:', err);
            throw err;
        }
    }, []);

    // Mettre à jour une catégorie
    const updateCategory = useCallback(async (id, categoryData) => {
        try {
            const response = await api.put(`/categories/${id}`, categoryData);
            const updated = response.data.category || response.data;
            setCategories(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            console.error('Erreur lors de la mise à jour de la catégorie:', err);
            throw err;
        }
    }, []);

    // Supprimer une catégorie
    const deleteCategory = useCallback(async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Erreur lors de la suppression de la catégorie:', err);
            throw err;
        }
    }, []);

    // Filtrer les catégories par type
    const getCategoriesByType = useCallback((type) => {
        return categories.filter(c => c.type === type);
    }, [categories]);

    const value = {
        categories,
        loading,
        error,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoriesByType,
        revenusCount: categories.filter(c => c.type === 'revenu').length,
        depensesCount: categories.filter(c => c.type === 'depense').length,
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) {
        throw new Error('useCategories doit être utilisé avec CategoryProvider');
    }
    return context;
};

export default CategoryContext;
