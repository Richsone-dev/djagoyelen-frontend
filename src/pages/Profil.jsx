import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Swal from 'sweetalert2';

// --- COMPOSANTS DE CHARGEMENT (SKELETONS) ---
const SkeletonSidebar = () => (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden placeholder-glow">
        <div style={{ height: '100px', backgroundColor: '#e9ecef' }}></div>
        <div className="card-body text-center pt-0" style={{ marginTop: '-50px' }}>
            <div className="rounded-circle mx-auto mb-3 placeholder" style={{ width: '100px', height: '100px' }}></div>
            <div className="placeholder col-8 mb-2 py-2"></div>
            <div className="placeholder col-5 py-2"></div>
            <div className="p-3 bg-light rounded-3 mt-3">
                <div className="placeholder col-12 mb-2"></div>
                <div className="placeholder col-10"></div>
            </div>
        </div>
    </div>
);

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

    const loadData = useCallback(async (showSkeleton = true) => {
        if (showSkeleton) setLoading(true);
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
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
            loadData(false); 
        } catch (error) {
            showFeedback('danger', "Erreur d'enregistrement.");
        }
    };

    const handleDeleteClient = async (id) => {
    const result = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: 'Cette action est irréversible !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        cancelButtonText: 'Annuler',
        confirmButtonText: 'Oui, supprimer'
    });

    if (result.isConfirmed) {
        try {
            // Suppression via l'API
            await api.delete(`/clients/${id}`);

            // Mise à jour de l'état local
            // Utiliser (prev => ...) garantit que vous travaillez avec la liste la plus récente
            setClients(prevClients => prevClients.filter(client => client.id !== id));

            Swal.fire(
                'Supprimé !',
                'Le client a été supprimé.',
                'success'
            );
        } catch (err) {
            console.error(err);
            
            // Message d'erreur dynamique basé sur la réponse du serveur
            const errorMessage = err.response?.data?.message || 'Une erreur est survenue lors de la suppression.';
            
            Swal.fire(
                'Erreur',
                errorMessage,
                'error'
            );
        }
    }
};

    const handleLogout = async () => {
        if (!window.confirm("Souhaitez-vous vraiment vous déconnecter ?")) return;
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Erreur serveur logout", error);
        } finally {
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="py-4" style={{ backgroundColor: theme.bgLight, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1100px' }}>
                
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold animate__animated animate__fadeIn`}>
                        {status.msg}
                    </div>
                )}

                <div className="row g-4 text-start">
                    {/* --- SIDEBAR --- */}
                    <div className="col-12 col-lg-4">
                        {loading ? <SkeletonSidebar /> : (
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

                                    <button className="btn btn-sm btn-outline-danger w-100 rounded-pill fw-bold border-0" onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SECURITE */}
                        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                            <h6 className="fw-bold mb-3"><i className="bi bi-shield-lock me-2 text-primary"></i>Sécurité</h6>
                            {!showPasswordForm ? (
                                <button className="btn btn-sm w-100 py-2 border rounded-3 fw-bold bg-white shadow-sm" onClick={() => setShowPasswordForm(true)}>
                                    Changer le mot de passe
                                </button>
                            ) : (
                                <form onSubmit={handleUpdatePassword} className="animate__animated animate__fadeIn">
                                    <input type="password" placeholder="Ancien mot de passe" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} />
                                    <input type="password" placeholder="Nouveau" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} />
                                    <input type="password" placeholder="Confirmer" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} />
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-sm btn-dark flex-grow-1 fw-bold">Valider</button>
                                        <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowPasswordForm(false)}>Annuler</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* --- CONTENT AREA --- */}
                    <div className="col-12 col-lg-8">
                        {/* FORM PROFIL */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Informations Personnelles</h5>
                                {!isEditing && (
                                    <button className="btn btn-sm btn-light border fw-bold px-3 shadow-sm" onClick={() => setIsEditing(true)}>
                                        <i className="bi bi-pencil-square me-2 text-primary"></i>Modifier
                                    </button>
                                )}
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Nom complet</label>
                                            <input type="text" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                value={formData.name} readOnly={!isEditing} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Email</label>
                                            <input type="email" className={`form-control border-0 bg-light ${isEditing ? 'bg-white border-bottom' : ''}`} 
                                                value={formData.email} readOnly={!isEditing}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
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

                        {/* LISTE CLIENTS */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Partenaires & Clients</h5>
                                <button className="btn btn-sm px-3 text-white fw-bold rounded-pill shadow-sm" style={{ backgroundColor: theme.darkGreen }} onClick={() => openClientModal()}>
                                    <i className="bi bi-plus-lg me-1"></i> Nouveau
                                </button>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr className="small text-muted text-uppercase">
                                                <th className="ps-4 border-0">Identité</th>
                                                <th className="border-0">Contact</th>
                                                <th className="text-end pe-4 border-0">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                [...Array(3)].map((_, i) => (
                                                    <tr key={i} className="placeholder-glow">
                                                        <td className="ps-4"><span className="placeholder col-8"></span></td>
                                                        <td><span className="placeholder col-6"></span></td>
                                                        <td className="text-end pe-4"><span className="placeholder col-4"></span></td>
                                                    </tr>
                                                ))
                                            ) : clients.length > 0 ? clients.map(client => (
                                                <tr key={client.id}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold text-dark">{client.nom}</div>
                                                        <div className="text-muted small fst-italic">{client.adresse || 'Aucune adresse'}</div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="small fw-bold text-primary">{client.telephone}</div>
                                                        <div className="text-muted" style={{fontSize: '0.75rem'}}>{client.email || 'N/A'}</div>
                                                    </td>
                                                    <td className="text-end pe-4 py-3">
                                                        <div className="btn-group shadow-sm rounded-3">
                                                            <button className="btn btn-sm btn-white border" onClick={() => openClientModal(client)}><i className="bi bi-pencil text-primary"></i></button>
                                                            <button className="btn btn-sm btn-white border" onClick={() => handleDeleteClient(client.id)}><i className="bi bi-trash text-danger"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="text-center py-5 text-muted">Aucun partenaire enregistré.</td></tr>
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
                <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(10,59,47,0.4)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <form onSubmit={handleClientSubmit}>
                                <div className="modal-header border-0 p-4">
                                    <h5 className="fw-bold mb-0">{editingClient ? 'Modifier Partenaire' : 'Ajouter un Partenaire'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsClientModalOpen(false)}></button>
                                </div>
                                <div className="modal-body px-4 pb-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Nom / Raison Sociale *</label>
                                            <input type="text" className="form-control rounded-3" required value={clientFormData.nom}
                                                onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Téléphone *</label>
                                            <input type="text" className="form-control rounded-3" required value={clientFormData.telephone}
                                                onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Email</label>
                                            <input type="email" className="form-control rounded-3" value={clientFormData.email}
                                                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Localisation / Adresse</label>
                                            <input type="text" className="form-control rounded-3" value={clientFormData.adresse}
                                                onChange={(e) => setClientFormData({...clientFormData, adresse: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button type="button" className="btn btn-link text-muted fw-bold text-decoration-none" onClick={() => setIsClientModalOpen(false)}>Annuler</button>
                                    <button type="submit" className="btn px-4 text-white fw-bold rounded-pill shadow-sm" style={{ backgroundColor: theme.darkGreen }}>
                                        {editingClient ? 'Mettre à jour' : 'Confirmer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .form-control:focus { box-shadow: none; border-color: ${theme.orange}; }
                .table-hover tbody tr:hover { background-color: #f1f3f2; transition: 0.2s; }
                .rounded-4 { border-radius: 1rem !important; }
                .btn-white { background: #fff; }
                .placeholder { border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default Profil;