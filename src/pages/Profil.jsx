import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Swal from 'sweetalert2';

// --- COMPOSANTS DE CHARGEMENT ---
const SkeletonSidebar = () => (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden placeholder-glow">
        <div style={{ height: '100px', backgroundColor: '#e9ecef' }}></div>
        <div className="card-body text-center pt-0" style={{ marginTop: '-50px' }}>
            <div className="rounded-circle mx-auto mb-3 placeholder" style={{ width: '100px', height: '100px' }}></div>
            <div className="placeholder col-8 mb-2 py-2"></div>
            <div className="placeholder col-5 py-2"></div>
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
    
    // États pour les formulaires (Initialisés à vide pour éviter l'erreur "uncontrolled")
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

    // Chargement initial des données
    const loadData = useCallback(async (showSkeleton = true) => {
        if (showSkeleton) setLoading(true);
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
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showFeedback = (type, msg) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
    };

    // --- MISE À JOUR DU PROFIL (NOM, EMAIL, TEL) ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/user/profile', formData);
            setUser(response.data); // Mise à jour des données affichées
            setIsEditing(false);
            
            Swal.fire({
                icon: 'success',
                title: 'Profil mis à jour',
                text: 'Vos nouvelles données ont été enregistrées en base de données.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            const msg = error.response?.data?.message || "Erreur lors de la mise à jour.";
            Swal.fire('Erreur', msg, 'error');
        }
    };

    // --- CHANGEMENT DE MOT DE PASSE ---
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.password_confirmation) {
            return showFeedback('danger', "Les mots de passe ne correspondent pas.");
        }
        try {
            await api.put('/user/password', passwordData);
            setShowPasswordForm(false);
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            Swal.fire('Succès', "Mot de passe modifié avec succès.", 'success');
        } catch (error) {
            const msg = error.response?.data?.message || "Échec du changement de mot de passe.";
            Swal.fire('Erreur', msg, 'error');
        }
    };

    // --- GESTION DES CLIENTS ---
    const openClientModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setClientFormData({ 
                nom: client.nom || '', 
                telephone: client.telephone || '', 
                email: client.email || '', 
                adresse: client.adresse || '' 
            });
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
            loadData(false); // Recharger la liste
        } catch (error) {
            Swal.fire('Erreur', "Impossible d'enregistrer le client.", 'error');
        }
    };

    const handleDeleteClient = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer ce client ?',
            text: "Cette action est irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/clients/${id}`);
                setClients(prev => prev.filter(c => c.id !== id));
                Swal.fire('Supprimé', 'Le client a été retiré.', 'success');
            } catch (err) {
                Swal.fire('Erreur', "Échec de la suppression.", 'error');
            }
        }
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Déconnexion',
            text: "Voulez-vous vraiment quitter ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non'
        });

        if (result.isConfirmed) {
            try { await api.post('/logout'); } catch {}
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="py-4" style={{ backgroundColor: theme.bgLight, minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1100px' }}>
                
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold`}>
                        {status.msg}
                    </div>
                )}

                <div className="row g-4 text-start">
                    {/* SIDEBAR */}
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
                                            <span>Statut :</span>
                                            <span className="fw-bold text-success">Actif</span>
                                        </div>
                                        <div className="d-flex justify-content-between small">
                                            <span>Partenaires :</span>
                                            <span className="fw-bold">{clients.length}</span>
                                        </div>
                                    </div>

                                    <button className="btn btn-sm btn-outline-danger w-100 rounded-pill fw-bold" onClick={handleLogout}>
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SÉCURITÉ */}
                        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                            <h6 className="fw-bold mb-3"><i className="bi bi-shield-lock me-2 text-primary"></i>Sécurité</h6>
                            {!showPasswordForm ? (
                                <button className="btn btn-sm w-100 py-2 border rounded-3 fw-bold bg-white" onClick={() => setShowPasswordForm(true)}>
                                    Changer le mot de passe
                                </button>
                            ) : (
                                <form onSubmit={handleUpdatePassword}>
                                    <input type="password" placeholder="Ancien mot de passe" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} />
                                    <input type="password" placeholder="Nouveau" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password: e.target.value})} />
                                    <input type="password" placeholder="Confirmer" className="form-control form-control-sm mb-2" required
                                        onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})} />
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-sm btn-dark flex-grow-1">Valider</button>
                                        <button type="button" className="btn btn-sm btn-light border" onClick={() => setShowPasswordForm(false)}>Annuler</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ZONE DE CONTENU */}
                    <div className="col-12 col-lg-8">
                        {/* FORMULAIRE PROFIL */}
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
                                            <input type="text" className={`form-control ${isEditing ? 'bg-white' : 'bg-light border-0'}`} 
                                                value={formData.name || ''} readOnly={!isEditing} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Email</label>
                                            <input type="email" className={`form-control ${isEditing ? 'bg-white' : 'bg-light border-0'}`} 
                                                value={formData.email || ''} readOnly={!isEditing}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small text-muted fw-bold">Téléphone</label>
                                            <input type="tel" className={`form-control ${isEditing ? 'bg-white' : 'bg-light border-0'}`} 
                                                value={formData.telephone || ''} readOnly={!isEditing}
                                                onChange={(e) => setFormData({...formData, telephone: e.target.value})} required />
                                        </div>
                                        {isEditing && (
                                            <div className="col-12 mt-3 d-flex gap-2">
                                                <button type="submit" className="btn btn-sm px-4 text-white fw-bold" style={{ backgroundColor: theme.orange }}>Sauvegarder</button>
                                                <button type="button" className="btn btn-sm btn-light px-4 border" onClick={() => setIsEditing(false)}>Annuler</button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* LISTE PARTENAIRES */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 fw-bold" style={{ color: theme.darkGreen }}>Mes Partenaires</h5>
                                <button className="btn btn-sm px-3 text-white fw-bold rounded-pill" style={{ backgroundColor: theme.darkGreen }} onClick={() => openClientModal()}>
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
                                                <tr><td colSpan="3" className="text-center py-4">Chargement...</td></tr>
                                            ) : clients.length > 0 ? clients.map(client => (
                                                <tr key={client.id}>
                                                    <td className="ps-4 py-3">
                                                        <div className="fw-bold">{client.nom}</div>
                                                        <div className="text-muted small">{client.adresse || 'Pas d\'adresse'}</div>
                                                    </td>
                                                    <td>
                                                        <div className="small fw-bold text-primary">{client.telephone}</div>
                                                        <div className="text-muted small">{client.email || 'N/A'}</div>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <div className="btn-group shadow-sm">
                                                            <button className="btn btn-sm btn-white border" onClick={() => openClientModal(client)}><i className="bi bi-pencil text-primary"></i></button>
                                                            <button className="btn btn-sm btn-white border" onClick={() => handleDeleteClient(client.id)}><i className="bi bi-trash text-danger"></i></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="text-center py-5">Aucun partenaire.</td></tr>
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
                <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4">
                            <form onSubmit={handleClientSubmit}>
                                <div className="modal-header border-0 p-4">
                                    <h5 className="fw-bold mb-0">{editingClient ? 'Modifier Partenaire' : 'Ajouter'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsClientModalOpen(false)}></button>
                                </div>
                                <div className="modal-body px-4 pb-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Nom *</label>
                                            <input type="text" className="form-control" required value={clientFormData.nom || ''}
                                                onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Téléphone *</label>
                                            <input type="text" className="form-control" required value={clientFormData.telephone || ''}
                                                onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">Email</label>
                                            <input type="email" className="form-control" value={clientFormData.email || ''}
                                                onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">Localisation</label>
                                            <input type="text" className="form-control" value={clientFormData.adresse || ''}
                                                onChange={(e) => setClientFormData({...clientFormData, adresse: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3 bg-light">
                                    <button type="button" className="btn btn-link text-muted fw-bold" onClick={() => setIsClientModalOpen(false)}>Annuler</button>
                                    <button type="submit" className="btn px-4 text-white fw-bold rounded-pill" style={{ backgroundColor: theme.darkGreen }}>
                                        Enregistrer
                                    </button>
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