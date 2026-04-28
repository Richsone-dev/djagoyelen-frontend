import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Clients = () => {
    // --- ÉTATS (States) ---
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', msg: '' });
    
    // NOUVEL ÉTAT : Recherche
    const [searchTerm, setSearchTerm] = useState('');
    
    // États pour les modales
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    // États pour les données
    const [editingClient, setEditingClient] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientPurchases, setClientPurchases] = useState([]);
    const [clientFormData, setClientFormData] = useState({ nom: '', telephone: '', email: '', adresse: '' });

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        bgLight: '#F8F9FA'
    };

    // --- EFFETS ---
    useEffect(() => {
        fetchClients();
    }, []);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredClients = clients.filter(client => 
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (client.telephone && client.telephone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // --- FONCTIONS LOGIQUES ---
    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) { 
            console.error("Erreur chargement clients", error);
            showFeedback('danger', "Erreur lors du chargement des clients.");
        } finally {
            setLoading(false);
        }
    };

    const openDetailsModal = async (client) => {
        setSelectedClient(client);
        setIsDetailsModalOpen(true);
        try {
            const response = await api.get('/factures');
            const purchases = response.data.filter(f => 
                f.client_id === client.id || (f.client && f.client.id === client.id)
            );
            setClientPurchases(purchases);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique", error);
            showFeedback('danger', "Impossible de charger l'historique d'achats.");
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
            fetchClients();
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
            fetchClients();
        } catch (error) { 
            showFeedback('danger', "Impossible de supprimer le client."); 
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

    const showFeedback = (type, msg) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus({ type: '', msg: '' }), 4000);
    };

    const formatPrix = (prix) => new Intl.NumberFormat('fr-FR').format(prix || 0);

    // --- RENDU UI ---
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="spinner-border" style={{color: colors.orange}} role="status"></div>
        </div>
    );

    return (
        <div className="py-4 py-md-5 text-start" style={{ backgroundColor: colors.bgLight, minHeight: '100vh' }}>
            <div className="container px-3 px-md-4" style={{ maxWidth: '1100px' }}>
                
                {status.msg && (
                    <div className={`alert alert-${status.type} border-0 shadow-sm mb-4 text-center fw-bold animate__animated animate__fadeIn`}>
                        {status.msg}
                    </div>
                )}

                {/* --- BARRE DE RECHERCHE ET ENTÊTE --- */}
                <div className="row mb-4 align-items-center g-3">
                    <div className="col-md-4">
                        <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>
                            <i className="bi bi-people-fill me-2"></i>Mes Clients
                        </h4>
                    </div>
                    <div className="col-md-5">
                        <div className="input-group shadow-sm rounded-pill overflow-hidden border">
                            <span className="input-group-text bg-white border-0 ps-3">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control border-0 py-2" 
                                placeholder="Rechercher par nom ou numéro..." 
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
                    <div className="col-md-3 text-md-end">
                        <button className="btn text-white fw-bold px-4 rounded-pill shadow-sm" 
                                style={{ backgroundColor: colors.orange }} 
                                onClick={() => openClientModal()}>
                            <i className="bi bi-plus-lg me-1"></i> Nouveau
                        </button>
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-muted text-uppercase">
                                    <th className="ps-4">Client</th>
                                    <th>Contact</th>
                                    <th className="text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.length > 0 ? filteredClients.map(client => (
                                    <tr key={client.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{client.nom}</div>
                                            <div className="text-muted small">{client.adresse || 'Sans adresse'}</div>
                                        </td>
                                        <td>
                                            <div className="small fw-medium">{client.telephone}</div>
                                            <div className="text-muted small">{client.email}</div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-light border me-1 shadow-sm" onClick={() => openDetailsModal(client)} title="Détails & Achats">
                                                <i className="bi bi-eye text-success"></i>
                                            </button>
                                            <button className="btn btn-sm btn-light border me-1 shadow-sm" onClick={() => openClientModal(client)}>
                                                <i className="bi bi-pencil text-primary"></i>
                                            </button>
                                            <button className="btn btn-sm btn-light border shadow-sm" onClick={() => handleDeleteClient(client.id)}>
                                                <i className="bi bi-trash text-danger"></i>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-5 text-muted">
                                            <i className="bi bi-search d-block fs-2 mb-2"></i>
                                            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucun client enregistré."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MODALE DÉTAILS & HISTORIQUE D'ACHATS (Inchangée) --- */}
            {isDetailsModalOpen && selectedClient && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered shadow-lg">
                        <div className="modal-content border-0 rounded-4">
                            <div className="modal-header border-0 px-4 pt-4">
                                <div>
                                    <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>Détails Client</h4>
                                    <p className="text-muted small mb-0">Historique complet des achats</p>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setIsDetailsModalOpen(false)}></button>
                            </div>
                            <div className="modal-body px-4 pt-2">
                                <div className="row mb-4 g-2">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 bg-light border">
                                            <label className="text-muted small text-uppercase fw-bold">Infos</label>
                                            <h5 className="fw-bold mb-1">{selectedClient.nom}</h5>
                                            <p className="mb-0 small">{selectedClient.adresse || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 bg-light border">
                                            <label className="text-muted small text-uppercase fw-bold">Contact</label>
                                            <p className="mb-0 small fw-bold">{selectedClient.telephone}</p>
                                            <p className="mb-0 small">{selectedClient.email || 'Pas d\'email'}</p>
                                        </div>
                                    </div>
                                </div>

                                <h6 className="fw-bold mb-3"><i className="bi bi-receipt me-2"></i>Liste des factures</h6>
                                <div className="table-responsive rounded-3 border">
                                    <table className="table table-sm table-hover mb-0">
                                        <thead className="bg-light">
                                            <tr className="small">
                                                <th className="ps-3 py-2">N° Facture</th>
                                                <th className="py-2 text-center">Date</th>
                                                <th className="py-2 text-end pe-3">Montant TTC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clientPurchases.length > 0 ? clientPurchases.map((f) => (
                                                <tr key={f.id}>
                                                    <td className="ps-3 py-2 fw-bold">#{f.num_facture}</td>
                                                    <td className="py-2 text-center small">{new Date(f.date_emission).toLocaleDateString()}</td>
                                                    <td className="py-2 text-end pe-3 fw-bold text-success">{formatPrix(f.total_ttc)} F</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="3" className="text-center py-3 text-muted">Aucune facture trouvée.</td></tr>
                                            )}
                                        </tbody>
                                        {clientPurchases.length > 0 && (
                                            <tfoot className="table-light">
                                                <tr>
                                                    <td colSpan="2" className="ps-3 fw-bold py-2 text-uppercase small">Total cumulé</td>
                                                    <td className="text-end pe-3 fw-bold py-2" style={{ color: colors.orange }}>
                                                        {formatPrix(clientPurchases.reduce((sum, f) => sum + Number(f.total_ttc), 0))} F CFA
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-0 px-4 pb-4">
                                <button type="button" className="btn btn-dark rounded-pill px-4" onClick={() => setIsDetailsModalOpen(false)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL AJOUT/MODIFICATION (Inchangée) --- */}
            {isClientModalOpen && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <form onSubmit={handleSaveClient}>
                                <div className="modal-header border-0 px-4 pt-4">
                                    <h5 className="modal-title fw-bold">{editingClient ? 'Modifier' : 'Ajouter'} un client</h5>
                                    <button type="button" className="btn-close" onClick={closeClientModal}></button>
                                </div>
                                <div className="modal-body px-4 text-start">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Nom / Raison Sociale</label>
                                        <input type="text" className="form-control rounded-3" value={clientFormData.nom} onChange={(e) => setClientFormData({...clientFormData, nom: e.target.value})} required />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted">Téléphone</label>
                                            <input type="text" className="form-control rounded-3" value={clientFormData.telephone} onChange={(e) => setClientFormData({...clientFormData, telephone: e.target.value})} />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold text-muted">Email</label>
                                            <input type="email" className="form-control rounded-3" value={clientFormData.email} onChange={(e) => setClientFormData({...clientFormData, email: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-muted">Adresse</label>
                                        <textarea className="form-control rounded-3" rows="2" value={clientFormData.adresse} onChange={(e) => setClientFormData({...clientFormData, adresse: e.target.value})}></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-4 pb-4">
                                    <button type="button" className="btn btn-light px-4 rounded-pill" onClick={closeClientModal}>Annuler</button>
                                    <button type="submit" className="btn px-4 text-white fw-bold rounded-pill shadow-sm" style={{ backgroundColor: colors.orange }}>
                                        {editingClient ? 'Mettre à jour' : 'Enregistrer'}
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

export default Clients;