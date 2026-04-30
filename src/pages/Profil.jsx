import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Profil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    
    // CORRIGÉ : Ajout de telephone dans l'état initial
    const [formData, setFormData] = useState({ name: '', email: '', telephone: '' });
    const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

    const [clients, setClients] = useState([]);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [clientFormData, setClientFormData] = useState({ nom: '', telephone: '', email: '', adresse: '' });

    const theme = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#28a745',
        bgLight: '#F8F9FA'
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userRes, clientsRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/clients')
            ]);
            setUser(userRes.data);
            // CORRIGÉ : Mise à jour avec le champ telephone
            setFormData({ 
                name: userRes.data.name || '', 
                email: userRes.data.email || '', 
                telephone: userRes.data.telephone || '' 
            });
            setClients(clientsRes.data);
        } catch (error) {
            showFeedback('danger', "Erreur de chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const showFeedback = (type, msg) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/user/profile', formData);
            setUser(response.data);
            setIsEditing(false);
            showFeedback('success', "Profil mis à jour !");
        } catch (error) {
            showFeedback('danger', "Erreur lors de la mise à jour.");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.password_confirmation) {
            return showFeedback('danger', "Les mots de passe ne correspondent pas.");
        }
        try {
            await api.put('/user/password', passwordData);
            setShowPasswordForm(false);
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            showFeedback('success', "Mot de passe modifié avec succès.");
        } catch (error) {
            showFeedback('danger', error.response?.data?.message || "Erreur de mise à jour.");
        }
    };

    const openClientModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setClientFormData({ nom: client.nom, telephone: client.telephone, email: client.email || '', adresse: client.adresse || '' });
        } else {
            setEditingClient(null);
            setClientFormData({ nom: '', telephone: '', email: '', adresse: '' });
        }
        setIsClientModalOpen(true);
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, clientFormData);
                showFeedback('success', "Client mis à jour.");
            } else {
                await api.post('/clients', clientFormData);
                showFeedback('success', "Client ajouté.");
            }
            setIsClientModalOpen(false);
            loadData();
        } catch (error) {
            showFeedback('danger', "Erreur lors de l'enregistrement du client.");
        }
    };

    const handleDeleteClient = async (id) => {
        if (window.confirm("Supprimer ce partenaire ?")) {
            try {
                await api.delete(`/clients/${id}`);
                setClients(clients.filter(c => c.id !== id));
                showFeedback('success', "Client supprimé.");
            } catch (error) {
                showFeedback('danger', "Erreur de suppression.");
            }
        }
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
            <div className="spinner-border" style={{color: theme.orange}} role="status"></div>
            <span className="mt-3 text-muted fw-bold">Initialisation de DjagoYelen...</span>
        </div>
    );

    return (
        <div className="py-4 mb-5" style={{ backgroundColor: theme.bgLight, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1100px' }}>
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold`}>
                        {status.msg}
                    </div>
                )}

                <div className="row g-4">
                    <div className="col-12 col-lg-8 offset-lg-2">
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Mon Profil</h5>
                                {!isEditing && (
                                    <button className="btn btn-sm btn-light border fw-bold" onClick={() => setIsEditing(true)}>
                                        <i className="bi bi-pencil-square me-2 text-primary"></i>Modifier
                                    </button>
                                )}
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="row g-3">
                                        <div className="col-md-6" style={{ textAlign: 'left' }}>
                                            <label className="form-label small text-muted fw-bold">Nom complet</label>
                                            <input type="text" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                value={formData.name} readOnly={!isEditing} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6" style={{ textAlign: 'left' }}>
                                            <label className="form-label small text-muted fw-bold">Email</label>
                                            <input type="email" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                value={formData.email} readOnly={!isEditing}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6" style={{ textAlign: 'left' }}>
                                            <label className="form-label small text-muted fw-bold">Téléphone</label>
                                            <input type="tel" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                value={formData.telephone} readOnly={!isEditing}
                                                onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
                                        </div>
                                        {isEditing && (
                                            <div className="col-12 mt-3 d-flex gap-2">
                                                <button type="submit" className="btn btn-sm px-4 text-white fw-bold shadow-sm" style={{ backgroundColor: theme.orange }}>Sauvegarder</button>
                                                <button type="button" className="btn btn-sm btn-light px-4 border" onClick={() => setIsEditing(false)}>Annuler</button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profil;