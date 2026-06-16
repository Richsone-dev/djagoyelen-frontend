import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const normalizeLanguage = (value) => {
    if (!value) {
        return 'fr';
    }

    const normalized = value.toString().trim().toLowerCase();
    if (normalized.startsWith('en')) return 'en';
    if (normalized.startsWith('fr')) return 'fr';
    if (['en', 'fr'].includes(normalized)) return normalized;

    return 'fr';
};

const translations = {
    fr: {
        dashboard: 'Tableau de bord',
        transactions: 'Transactions',
        categories: 'Catégories',
        budgets: 'Budgets',
        reports: 'Rapports',
        profile: 'Profil',
        about: 'À propos',
        settings: 'Paramètres',
        clients: 'Clients',
        invoices: 'Factures',
        notifications: 'Notifications',
        help: 'Aide',
        debts: 'Dettes',
        administration: 'Administration',
        management: 'Gestion',
        logout: 'Déconnexion',
        all: 'Toutes',
        unread: 'Non lues',
        markAllRead: 'Tout lire',
        noNotifications: 'Aucune notification',
        new: 'Nouveau',
        viewAllNotifications: 'Voir toutes les notifications',
        systemAlerts: 'Alertes système',
        general: 'Général',
        enterprise: 'Entreprise',
        notificationSettings: 'Notifications',
        security: 'Sécurité',
        language: 'Langue du système',
        currency: 'Devise par défaut',
        appearance: 'Apparence de l’interface',
        light: 'Clair',
        dark: 'Sombre',
        save: 'Enregistrer',
        statusSaved: 'Préférences enregistrées !',
        admin: 'Admin',
        createAdmin: 'Créer un administrateur',
        promoteAdmin: 'Promouvoir en administrateur',
        personalInfo: 'Informations personnelles',
        name: 'Nom',
        email: 'Email',
        telephone: 'Téléphone',
        profilePhoto: 'Photo de profil',
        updateProfile: 'Mettre à jour le profil',
        saveChanges: 'Enregistrer',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        changePassword: 'Changer le mot de passe',
        profileUpdated: 'Profil mis à jour avec succès.',
        passwordUpdated: 'Mot de passe modifié avec succès.',
        loadingDataError: 'Impossible de charger les données.',
    },
    en: {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        categories: 'Categories',
        budgets: 'Budgets',
        reports: 'Reports',
        profile: 'Profile',
        about: 'About',
        settings: 'Settings',
        clients: 'Clients',
        invoices: 'Invoices',
        notifications: 'Notifications',
        help: 'Help',
        debts: 'Debts',
        administration: 'Administration',
        management: 'Management',
        logout: 'Logout',
        all: 'All',
        unread: 'Unread',
        markAllRead: 'Mark all read',
        noNotifications: 'No notifications',
        new: 'New',
        viewAllNotifications: 'View all notifications',
        systemAlerts: 'System alerts',
        general: 'General',
        enterprise: 'Company',
        notificationSettings: 'Notifications',
        security: 'Security',
        language: 'Language',
        currency: 'Default currency',
        appearance: 'Appearance',
        light: 'Light',
        dark: 'Dark',
        save: 'Save',
        statusSaved: 'Preferences saved!',
        admin: 'Admin',
        createAdmin: 'Create administrator',
        promoteAdmin: 'Promote to administrator',
        personalInfo: 'Personal information',
        name: 'Name',
        email: 'Email',
        telephone: 'Phone',
        profilePhoto: 'Profile photo',
        updateProfile: 'Update profile',
        saveChanges: 'Save changes',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        changePassword: 'Change password',
        profileUpdated: 'Profile updated successfully.',
        passwordUpdated: 'Password changed successfully.',
        loadingDataError: 'Unable to load data.',
    },
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(normalizeLanguage(localStorage.getItem('langue')));

    useEffect(() => {
        localStorage.setItem('langue', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] ?? key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
