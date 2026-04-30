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
    
    const [formData, setFormData] = useState({ name: '', email: '', telephone: '' });
    const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });

    const [clients, setClients] = useState([]);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [clientFormData, setClientFormData] = useState({ nom: '', telephone: '', email: '', adresse: '' });

    const theme = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
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
            showFeedback('danger', "Erreur lors de la mise à jour.");
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
            showFeedback('danger', "Erreur lors de l'enregistrement.");
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
            <span className="mt-3 text-muted fw-bold">Chargement DjagoYelen...</span>
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
                    {/* Sidebar */}
                    <div className="col-12 col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                            <div style={{ height: '100px', backgroundColor: theme.darkGreen }}></div>
                            <div className="card-body text-center pt-0" style={{ marginTop: '-50px' }}>
                                <div className="rounded-circle border border-4 border-white shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" 
                                     style={{ width: '100px', height: '100px', backgroundColor: theme.orange, color: 'white', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <h5 className="fw-bold mb-0">{user?.name}</h5>
                                <p className="text-muted small mb-3">{user?.email}</p>
                            </div>
                        </div>

                        {/* Sécurité */}
                        <div className="card border-0 shadow-sm rounded-4 p-3">
                            <h6 className="fw-bold mb-3">Sécurité</h6>
                            {!showPasswordForm ? (
                                <button className="btn btn-sm w-100 py-2 border rounded-3 fw-bold bg-white" onClick={() => setShowPasswordForm(true)}>
                                    Changer le mot de passe
                                </button>
                            ) : (
                                <form onSubmit={handleUpdatePassword}>
                                    <input type="password" placeholder="Actuel" className="form-control form-control-sm mb-2" required onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} />
                                    <input type="password" placeholder="Nouveau" className="form-control form-control-sm mb-2" required onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} />
                                    <input type="password" placeholder="Confirmer" className="form-control form-control-sm mb-2" required onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} />
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-sm btn-dark flex-grow-1 fw-bold">Valider</button>
                                        <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowPasswordForm(false)}>X</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="col-12 col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Mon Profil</h5>
                                {!isEditing && <button className="btn btn-sm btn-light border" onClick={() => setIsEditing(true)}>Modifier</button>}
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Nom complet</label>
                                            <input type="text" className="form-control" value={formData.name} readOnly={!isEditing} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Email</label>
                                            <input type="email" className="form-control" value={formData.email} readOnly={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label small text-muted fw-bold">Téléphone</label>
                                            <input type="tel" className="form-control" value={formData.telephone} readOnly={!isEditing} onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
                                        </div>
                                        {isEditing && (
                                            <div className="col-12 mt-3">
                                                <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: theme.orange }}>Sauvegarder</button>
                                                <button type="button" className="btn btn-light ms-2" onClick={() => setIsEditing(false)}>Annuler</button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Liste Clients */}
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Mes Clients</h5>
                                <button className="btn btn-sm text-white rounded-pill px-3" style={{ backgroundColor: theme.darkGreen }} onClick={() => openClientModal()}>+ Nouveau</button>
                            </div>
                            <div className="card-body p-0">
                                <table className="table table-hover align-middle mb-0">
                                    <tbody>
                                        {clients.map(client => (
                                            <tr key={client.id}>
                                                <td className="ps-4">{client.nom}</td>
                                                <td>{client.telephone}</td>
                                                <td className="text-end pe-4">
                                                    <button className="btn btn-sm btn-link" onClick={() => openClientModal(client)}>Modifier</button>
                                                    <button className="btn btn-sm btn-link text-danger" onClick={() => handleDeleteClient(client.id)}>Supprimer</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isClientModalOpen && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-4">
                            <form onSubmit={handleClientSubmit}>
                                <h5>{editingClient ? 'Modifier' : 'Nouveau Client'}</h5>
                                <input className="form-control mb-2" placeholder="Nom" required value={clientFormData.nom} onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} />
                                <input className="form-control mb-2" placeholder="Téléphone" required value={clientFormData.telephone} onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} />
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button type="button" className="btn btn-light" onClick={() => setIsClientModalOpen(false)}>Annuler</button>
                                    <button type="submit" className="btn text-white" style={{ backgroundColor: theme.darkGreen }}>Valider</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profil;