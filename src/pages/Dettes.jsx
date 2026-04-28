import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Dettes = () => {
    const [dettes, setDettes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        contact_name: '',
        amount: '',
        category_id: '',
        type: 'a_payer',
        due_date: '',
        status: 'non_paye'
    });
    const [editingId, setEditingId] = useState(null);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754'
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dettesRes, categoriesRes] = await Promise.all([
                api.get('/dettes'),
                api.get('/categories')
            ]);
            setDettes(dettesRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Erreur lors du chargement", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/dettes/${editingId}`, formData);
                // Si le statut est passé à 'paye', le backend a déjà mis à jour le solde
            } else {
                await api.post('/dettes', formData);
            }
            
            setShowModal(false);
            resetForm();
            fetchData(); // Rafraîchit la liste (et indirectement ton solde si tu as un composant Global)
            
        } catch (error) {
            alert("Erreur: " + (error.response?.data?.message || "Échec de l'opération"));
        }
    };

    const resetForm = () => {
        setFormData({
            contact_name: '',
            amount: '',
            category_id: '',
            type: 'a_payer',
            due_date: '',
            status: 'non_paye'
        });
        setEditingId(null);
    };

    const handleEdit = (dette) => {
        // Préparation des données pour le formulaire (gestion des dates nulles)
        setFormData({
            ...dette,
            due_date: dette.due_date ? dette.due_date.split('T')[0] : ''
        });
        setEditingId(dette.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette dette?")) {
            try {
                await api.delete(`/dettes/${id}`);
                fetchData();
            } catch (error) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    // Helpers pour l'UI
    const getStatusBadge = (status) => {
        const badges = { 'non_paye': 'bg-danger', 'partiellement_paye': 'bg-warning', 'paye': 'bg-success' };
        return badges[status] || 'bg-secondary';
    };

    const getStatusLabel = (status) => {
        const labels = { 'non_paye': 'Non payé', 'partiellement_paye': 'Partiellement payé', 'paye': 'Payé' };
        return labels[status] || status;
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
            <div className="spinner-grow" style={{color: colors.orange}} role="status"></div>
        </div>
    );

    return (
        <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="container-fluid">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <h2 style={{ color: colors.darkGreen }} className="fw-bold">📊 Gestion des Dettes</h2>
                    <button 
                        className="btn shadow-sm" 
                        style={{ backgroundColor: colors.orange, color: 'white' }}
                        onClick={() => { resetForm(); setShowModal(true); }}
                    >
                        <i className="bi bi-plus-circle me-2"></i>Ajouter une Dette
                    </button>
                </div>

                {dettes.length === 0 ? (
                    <div className="alert alert-info text-center border-0 shadow-sm">
                        <i className="bi bi-info-circle me-2"></i>Aucune dette trouvée.
                    </div>
                ) : (
                    <div className="table-responsive bg-white rounded shadow-sm">
                        <table className="table table-hover mb-0">
                            <thead style={{ backgroundColor: colors.darkGreen, color: 'white' }}>
                                <tr>
                                    <th className="py-3 ps-4">Personne</th>
                                    <th className="py-3">Montant</th>
                                    <th className="py-3">Catégorie</th>
                                    <th className="py-3">Type</th>
                                    <th className="py-3">Statut</th>
                                    <th className="py-3">Échéance</th>
                                    <th className="py-3 text-end pe-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dettes.map(dette => (
                                    <tr key={dette.id} className="align-middle">
                                        <td className="ps-4 fw-bold text-secondary">{dette.contact_name}</td>
                                        <td className="fw-bold">{Number(dette.amount).toLocaleString()} FCFA</td>
                                        <td>{dette.category?.nom || 'N/A'}</td>
                                        <td>
                                            <span className={`badge rounded-pill ${dette.type === 'a_payer' ? 'bg-light text-danger border border-danger' : 'bg-light text-primary border border-primary'}`}>
                                                {dette.type === 'a_payer' ? '💰 À Payer' : '💸 À Encaisser'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(dette.status)}`}>
                                                {getStatusLabel(dette.status)}
                                            </span>
                                        </td>
                                        <td>{dette.due_date ? new Date(dette.due_date).toLocaleDateString('fr-FR') : '-'}</td>
                                        <td className="text-end pe-4">
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(dette)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(dette.id)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 text-white" style={{ backgroundColor: colors.darkGreen }}>
                                    <h5 className="modal-title">{editingId ? '✏️ Modifier la Dette' : '➕ Nouvelle Dette'}</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body p-4" style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Nom du contact</label>
                                                <input type="text" className="form-control" placeholder="Nom du contact" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} required />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Montant (FCFA)</label>
                                                <input type="number" className="form-control" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required min="0" />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Catégorie</label>
                                                <select className="form-select" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} required>
                                                    <option value="">Sélectionner...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nom}</option>)}
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Type de transaction</label>
                                                <select className="form-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                                    <option value="a_payer">💰 À Payer (Dette)</option>
                                                    <option value="a_encaisser">💸 À Encaisser (Crédit)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Statut actuel</label>
                                                <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                                    <option value="non_paye">Non payé</option>
                                                    <option value="partiellement_paye">Partiel</option>
                                                    <option value="paye">✅ Payé</option>
                                                </select>
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Date d'échéance</label>
                                                <input type="date" className="form-control" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 p-4 pt-0">
                                        <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                                        <button type="submit" className="btn px-4" style={{ backgroundColor: colors.orange, color: 'white' }}>
                                            {editingId ? 'Enregistrer les modifications' : 'Créer la dette'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dettes;