import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Profil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    
    const [formData, setFormData] = useState({ name: '', email: '' });
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
            setFormData({ name: userRes.data.name, email: userRes.data.email });
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

    // --- LOGIQUE PROFIL ---
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

    // --- LOGIQUE CLIENTS (PARTENAIRES) ---
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
            loadData(); // Recharger la liste
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



const handleLogout = async () => {
    if (!window.confirm("Souhaitez-vous vraiment vous déconnecter ?")) {
        return; // On arrête tout si l'utilisateur annule
    }

    try {
        // 1. On informe d'abord le backend (Laravel) pour invalider le token
        await api.post('/logout');
    } catch (error) {
        console.error("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
        // 2. Nettoyage local (toujours exécuté, même si l'API échoue)
        localStorage.clear(); 
        
        // 3. Redirection propre via React Router
        navigate('/login');
    }
};

    if (loading) return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
            <div className="spinner-border" style={{color: theme.orange}} role="status"></div>
            <span className="mt-3 text-muted fw-bold">Initialisation de DjagoYelen...</span>
        </div>
    );

    return (
        <div className="py-4" mb-5 style={{ backgroundColor: theme.bgLight, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1100px' }}>
                
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold animate__animated animate__fadeIn`}>
                        {status.msg}
                    </div>
                )}

                <div className="row g-4">
                    {/* --- Sidebar --- */}
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
                                
                                <div className="p-3 bg-light rounded-3 mb-3">
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Statut :</span>
                                        <span className="fw-bold text-success">Actif</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="text-muted">Clients :</span>
                                        <span className="fw-bold">{clients.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sécurité */}
                        <div className="card border-0 shadow-sm rounded-4 p-2">
                            <h6 className="fw-bold mb-3"><i className="bi bi-shield-lock me-2 text-primary"></i>Sécurité</h6>
                            {!showPasswordForm ? (
                                <button className="btn btn-sm w-100 py-2 border rounded-3 fw-bold bg-white" onClick={() => setShowPasswordForm(true)}>
                                    Changer le mot de passe
                                </button>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="animate__animated animate__fadeIn">
                                    <input type="password" placeholder="Mot de passe actuel" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} />
                                    <input type="password" placeholder="Nouveau mot de passe" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} />
                                    <input type="password" placeholder="Confirmer" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} />
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-sm btn-dark flex-grow-1 fw-bold">Mettre à jour</button>
                                        <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowPasswordForm(false)}>X</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* --- Content --- */}
                    <div className="col-12 col-lg-8">
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
                                        {isEditing && (
                                            <div className="col-md-6" style={{ textAlign: 'left' }}>
                                                <label className="form-label small text-muted fw-bold">Téléphone</label>
                                                <input type="tel" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                    value={formData.telephone} readOnly={!isEditing}
                                                    onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
                                            </div>
                                        )}
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

                        {/* Liste des Clients */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Mes Clients</h5>
                                <button className="btn btn-sm px-3 text-white fw-bold rounded-pill" style={{ backgroundColor: theme.darkGreen }} onClick={() => openClientModal()}>
                                    <i className="bi bi-plus-lg me-2"></i>Nouveau
                                </button>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr className="small text-muted">
                                                <th className="ps-4 border-0">NOM / ADRESSE</th>
                                                <th className="border-0">CONTACT</th>
                                                <th className="text-end pe-4 border-0">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map(client => (
                                                <tr key={client.id}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold text-dark">{client.nom}</div>
                                                        <div className="text-muted small italic">{client.adresse || 'Sans adresse'}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="small fw-bold">{client.telephone}</div>
                                                        <div className="text-muted x-small">{client.email}</div>
                                                    </td>
                                                    <td className="text-end pe-4 py-3">
                                                        <div className="btn-group shadow-sm">
                                                            <button className="btn btn-sm btn-white border" onClick={() => openClientModal(client)}><i className="bi bi-pencil text-primary"></i></button>
                                                            <button className="btn btn-sm btn-white border" onClick={() => handleDeleteClient(client.id)}><i className="bi bi-trash text-danger"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {clients.length === 0 && (
                                                <tr><td colSpan="3" className="text-center py-4">Aucun client trouvé.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CLIENT */}
            {isClientModalOpen && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ textAlign: 'left' }}>
                        <div className="modal-content border-0 rounded-4 shadow">
                            <form onSubmit={handleClientSubmit}>
                                <div className="modal-header border-0">
                                    <h5 className="fw-bold">{editingClient ? 'Modifier Client' : 'Nouveau Client'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsClientModalOpen(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Nom complet *</label>
                                        <input type="text" className="form-control" required value={clientFormData.nom}
                                            onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Téléphone *</label>
                                        <input type="text" className="form-control" required value={clientFormData.telephone}
                                            onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Email</label>
                                        <input type="email" className="form-control" value={clientFormData.email}
                                            onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Adresse</label>
                                        <input type="text" className="form-control" value={clientFormData.adresse}
                                            onChange={(e) => setClientFormData({...clientFormData, adresse: e.target.value})} />
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light border fw-bold" onClick={() => setIsClientModalOpen(false)}>Annuler</button>
                                    <button type="submit" className="btn text-white fw-bold" style={{ backgroundColor: theme.darkGreen }}>
                                        {editingClient ? 'Mettre à jour' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .x-small { font-size: 0.75rem; }
                .italic { font-style: italic; }
                .form-control:focus { box-shadow: none; border-color: ${theme.orange}; }
                .table-hover tbody tr:hover { background-color: #f1f3f2; transition: 0.2s; }
                .rounded-4 { border-radius: 1rem !important; }
            `}</style>
        </div>
    );
};

export default Profil;