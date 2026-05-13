import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

// --- COMPOSANT DE CHARGEMENT (SKELETON) ---
const SkeletonRow = () => (
    <tr className="placeholder-glow">
        <td className="ps-4 py-3">
            <span className="placeholder col-8 mb-1 d-block"></span>
            <span className="placeholder col-5 small"></span>
        </td>
        <td className="py-3">
            <span className="placeholder col-6 mb-1 d-block"></span>
            <span className="placeholder col-4 small"></span>
        </td>
        <td className="text-end pe-4 py-3">
            <span className="placeholder col-6 py-3 rounded-2"></span>
        </td>
    </tr>
);

const Clients = () => {
    // --- ÉTATS ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientPurchases, setClientPurchases] = useState([]);
    const [clientFormData, setClientFormData] = useState({ nom: '', telephone: '', email: '', adresse: '' });

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        bgLight: '#F8F9FA'
    };

    // --- LOGIQUE DE RÉCUPÉRATION ---
    const fetchClients = useCallback(async (showSkeleton = true) => {
        if (showSkeleton) setLoading(true);
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) { 
            showFeedback('danger', "Erreur lors du chargement des clients.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // --- FILTRAGE ---
    const filteredClients = clients.filter(client => 
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (client.telephone && client.telephone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- ACTIONS ---
    const showFeedback = (type, msg) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
    };

    const openDetailsModal = async (client) => {
        setSelectedClient(client);
        setIsDetailsModalOpen(true);
        setHistoryLoading(true);
        try {
            const response = await api.get('/factures');
            const purchases = response.data.filter(f => 
                f.client_id === client.id || (f.client && f.client.id === client.id)
            );
            setClientPurchases(purchases);
        } catch (error) {
            showFeedback('danger', "Impossible de charger l'historique.");
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSaveClient = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, clientFormData);
                showFeedback('success', "Client mis à jour !");
            } else {
                await api.post('/clients', clientFormData);
                showFeedback('success', "Nouveau client ajouté !");
            }
            fetchClients(false); // Recharge discrètement
            closeClientModal();
        } catch (error) { 
            showFeedback('danger', "Erreur lors de l'enregistrement."); 
        }
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;
        try {
            await api.delete(`/clients/${id}`);
            showFeedback('success', "Client supprimé.");
            setClients(clients.filter(c => c.id !== id));
        } catch (error) { 
            showFeedback('danger', "Action impossible (client lié à des factures)."); 
        }
    };

    const openClientModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setClientFormData({ 
                nom: client.nom, 
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

    const closeClientModal = () => {
        setIsClientModalOpen(false);
        setEditingClient(null);
    };

    const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix || 0);

    return (
        <div className="py-4 py-md-5 text-start" style={{ backgroundColor: colors.bgLight, minHeight: '100vh' }}>
            <div className="container px-3 px-md-4" style={{ maxWidth: '1100px' }}>
                
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold animate__animated animate__fadeIn`}>
                        {status.msg}
                    </div>
                )}

                {/* --- HEADER & RECHERCHE --- */}
                <div className="row mb-4 align-items-center g-3">
                    <div className="col-md-4 text-center text-md-start">
                        <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>
                            <i className="bi bi-people-fill me-2 text-primary"></i>Mes Clients
                        </h4>
                    </div>
                    <div className="col-md-5">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white">
                            <span className="input-group-text bg-white border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-0 py-2 shadow-none" 
                                placeholder="Nom, téléphone, email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn bg-white border-0 text-muted" onClick={() => setSearchTerm('')}>
                                    <i className="bi bi-x-circle"></i>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-3 text-center text-md-end">
                        <button className="btn text-white fw-bold px-4 rounded-pill shadow-sm border-0" 
                                style={{ backgroundColor: colors.orange }} 
                                onClick={() => openClientModal()}>
                            <i className="bi bi-plus-lg me-1"></i> Nouveau
                        </button>
                    </div>
                </div>

                {/* --- TABLEAU --- */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-muted text-uppercase">
                                    <th className="ps-4 border-0">Client</th>
                                    <th className="border-0">Contact</th>
                                    <th className="text-end pe-4 border-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                ) : filteredClients.length > 0 ? (
                                    filteredClients.map(client => (
                                        <tr key={client.id}>
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">{client.nom}</div>
                                                <div className="text-muted small fst-italic">{client.adresse || 'Sans adresse'}</div>
                                            </td>
                                            <td className="py-3">
                                                <div className="small fw-bold text-primary">{client.telephone}</div>
                                                <div className="text-muted small" style={{fontSize: '0.8rem'}}>{client.email || 'N/A'}</div>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <div className="btn-group shadow-sm rounded-3 overflow-hidden border">
                                                    <button className="btn btn-sm btn-white px-3" onClick={() => openDetailsModal(client)} title="Détails">
                                                        <i className="bi bi-eye text-success"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-white px-3 border-start" onClick={() => openClientModal(client)}>
                                                        <i className="bi bi-pencil text-primary"></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-white px-3 border-start" onClick={() => handleDeleteClient(client.id)}>
                                                        <i className="bi bi-trash text-danger"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            <i className="bi bi-person-x d-block fs-1 mb-2 opacity-50"></i>
                                            {searchTerm ? `Aucun client trouvé pour "${searchTerm}"` : "Vous n'avez pas encore de client."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODALE DÉTAILS --- */}
            {isDetailsModalOpen && selectedClient && (
                <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(10,59,47,0.4)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-header border-0 px-4 pt-4 bg-white">
                                <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>Fiche Client</h4>
                                <button type="button" className="btn-close shadow-none" onClick={() => setIsDetailsModalOpen(false)}></button>
                            </div>
                            <div className="modal-body px-4 pt-2">
                                <div className="row mb-4 g-3">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 bg-light border-start border-4 border-primary">
                                            <label className="text-muted small text-uppercase fw-bold">Identité</label>
                                            <h5 className="fw-bold mb-1 text-dark">{selectedClient.nom}</h5>
                                            <p className="mb-0 small text-muted"><i className="bi bi-geo-alt me-1"></i>{selectedClient.adresse || 'Non renseigné'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 bg-light border-start border-4 border-success">
                                            <label className="text-muted small text-uppercase fw-bold">Contact Rapide</label>
                                            <p className="mb-0 small fw-bold text-dark"><i className="bi bi-telephone me-2"></i>{selectedClient.telephone}</p>
                                            <p className="mb-0 small text-muted"><i className="bi bi-envelope me-2"></i>{selectedClient.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                    <span className="badge bg-dark rounded-circle me-2" style={{width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                        {clientPurchases.length}
                                    </span>
                                    Historique des Achats
                                </h6>
                                
                                <div className="table-responsive rounded-3 border bg-white">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr className="small text-muted">
                                                <th className="ps-3 py-2">Réf. Facture</th>
                                                <th className="py-2 text-center">Date</th>
                                                <th className="py-2 text-end pe-3">Montant TTC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyLoading ? (
                                                <tr><td colSpan="3" className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                            ) : clientPurchases.length > 0 ? clientPurchases.map((f) => (
                                                <tr key={f.id}>
                                                    <td className="ps-3 py-2 fw-bold text-dark">#{f.numero_facture}</td>
                                                    <td className="py-2 text-center small">{new Date(f.date_emission).toLocaleDateString()}</td>
                                                    <td className="py-2 text-end pe-3 fw-bold text-success">{formatPrix(f.total_ttc)} F</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="text-center py-4 text-muted small">Aucune transaction enregistrée.</td></tr>
                                            )}
                                        </tbody>
                                        {!historyLoading && clientPurchases.length > 0 && (
                                            <tfoot className="bg-light fw-bold border-top">
                                                <tr>
                                                    <td colSpan="2" className="ps-3 py-3 text-uppercase small">Chiffre d'affaires total</td>
                                                    <td className="text-end pe-3 py-3 fs-5" style={{ color: colors.orange }}>
                                                        {formatPrix(clientPurchases.reduce((sum, f) => sum + Number(f.total_ttc), 0))} <small>F CFA</small>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-0 px-4 pb-4 bg-white">
                                <button className="btn btn-dark rounded-pill px-4 fw-bold" onClick={() => setIsDetailsModalOpen(false)}>Fermer l'aperçu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL FORMULAIRE --- */}
            {isClientModalOpen && (
                <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <form onSubmit={handleSaveClient}>
                                <div className="modal-header border-0 px-4 pt-4">
                                    <h5 className="modal-title fw-bold text-dark">
                                        {editingClient ? <i className="bi bi-pencil-square me-2"></i> : <i className="bi bi-person-plus me-2"></i>}
                                        {editingClient ? 'Modifier le client' : 'Nouveau Client'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={closeClientModal}></button>
                                </div>
                                <div className="modal-body px-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Nom ou Raison Sociale *</label>
                                        <input type="text" className="form-control rounded-3 border-2" 
                                               style={{borderColor: '#eee'}}
                                               value={clientFormData.nom} 
                                               onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} required />
                                    </div>
                                    <div className="row g-3 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted">Téléphone *</label>
                                            <input type="text" className="form-control rounded-3" 
                                                   value={clientFormData.telephone} 
                                                   onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted">Email</label>
                                            <input type="email" className="form-control rounded-3" 
                                                   value={clientFormData.email} 
                                                   onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted">Adresse géographique</label>
                                        <textarea className="form-control rounded-3" rows="2" 
                                                  value={clientFormData.adresse} 
                                                  onChange={(e) => setClientFormData({...clientFormData, adresse: e.target.value})}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light px-4 rounded-pill fw-bold text-muted" onClick={closeClientModal}>Annuler</button>
                                    <button type="submit" className="btn px-5 text-white fw-bold rounded-pill shadow-sm border-0" 
                                            style={{ backgroundColor: colors.orange }}>
                                        {editingClient ? 'Sauvegarder' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .btn-white { background: #fff; border: none; }
                .btn-white:hover { background: #f8f9fa; }
                .form-control:focus { border-color: ${colors.orange}; box-shadow: none; }
                .rounded-4 { border-radius: 1rem !important; }
                .table thead th { font-weight: 700; font-size: 0.75rem; letter-spacing: 0.5px; }
            `}</style>
        </div>
    );
};

export default Clients;