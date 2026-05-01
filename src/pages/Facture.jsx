import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Select from 'react-select';

const Facture = () => {
    // --- ÉTATS ---
    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [showClientModal, setShowClientModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedFacture, setSelectedFacture] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newClient, setNewClient] = useState({ nom: '', email: '', telephone: '', adresse: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const colors = { darkGreen: '#0A3B2F', successGreen: '#198754', orange: '#E97223', lightBg: '#f4f7f6' };

    const initialFormState = {
        id: null,
        client_id: '',
        date_emission: new Date().toISOString().split('T')[0],
        items: [{ designation: '', quantite: 1, prix_unitaire: 0 }],
        tva_taux: 18,
        total_ht: 0,
        total_ttc: 0
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- CHARGEMENT DES DONNÉES ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resFactures, resClients] = await Promise.all([
                api.get('/factures'),
                api.get('/clients')
            ]);
            setFactures(Array.isArray(resFactures.data) ? resFactures.data : []);
            setClients(Array.isArray(resClients.data) ? resClients.data : []);
        } catch (error) {
            console.error("Erreur de chargement:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- CALCULS AUTOMATIQUES ---
    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => sum + (Number(item.quantite || 0) * Number(item.prix_unitaire || 0)), 0);
        const tva = ht * (Number(formData.tva_taux) / 100);
        setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (prix) => Number(prix).toLocaleString('fr-FR');

    // --- ACTIONS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await api.put(`/factures/${formData.id}`, formData);
            else await api.post('/factures', formData);
            
            setView('list');
            setFormData(initialFormState);
            fetchData();
        } catch (error) { 
            console.error(error);
            alert("Erreur lors de l'enregistrement"); 
        }
    };

    const handleItemChange = (idx, field, val) => {
        const newItems = [...formData.items];
        newItems[idx][field] = field === 'designation' ? val : (val === '' ? 0 : Number(val));
        setFormData({ ...formData, items: newItems });
    };

    const handleQuickAddClient = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/clients', newClient);
            setClients([...clients, res.data]);
            setFormData({ ...formData, client_id: res.data.id });
            setShowClientModal(false);
            setNewClient({ nom: '', email: '', telephone: '', adresse: '' });
        } catch (error) { alert("Erreur ajout client"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette facture ?")) {
            try { await api.delete(`/factures/${id}`); fetchData(); } 
            catch (error) { alert("Erreur de suppression"); }
        }
    };

    const handleEdit = (facture) => {
        setIsEditing(true);
        setFormData({
            ...facture,
            client_id: facture.client_id || facture.client?.id,
            items: facture.items || []
        });
        setView('form');
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="p-2 p-md-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            <div className="container-fluid">
                {view === 'list' ? (
                    <div>
                        <div className="d-flex flex-column flex-md-row justify-content-between mb-4 bg-white p-3 rounded shadow-sm gap-3">
                            <h2 style={{ color: colors.darkGreen }} className="fw-bold fs-4">🧾 Factures</h2>
                            <input className="form-control" style={{ maxWidth: '300px' }} placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <button className="btn text-white" style={{ backgroundColor: colors.orange }} onClick={() => { setIsEditing(false); setFormData(initialFormState); setView('form'); }}>+ Créer une Facture</button>
                        </div>
                        <div className="card border-0 shadow-sm">
                            <table className="table table-hover">
                                <thead><tr><th>N°</th><th>Client</th><th>Montant</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {factures.filter(f => f.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                                        <tr key={f.id}>
                                            <td>#{f.id}</td>
                                            <td>{f.client?.nom}</td>
                                            <td>{formatPrix(f.total_ttc)} F</td>
                                            <td>
                                                <button className="btn btn-sm text-primary" onClick={() => handleEdit(f)}>Éditer</button>
                                                <button className="btn btn-sm text-danger" onClick={() => handleDelete(f.id)}>Supprimer</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="card p-4">
                        <h3>{isEditing ? 'Modifier' : 'Nouvelle'} Facture</h3>
                        <form onSubmit={handleSubmit}>
                            <label className="mb-2">Client</label>
                            <Select
                                options={clients.map(c => ({ value: c.id, label: c.nom }))}
                                value={clients.find(c => c.id === formData.client_id) ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                                onChange={(selected) => setFormData({ ...formData, client_id: selected.value })}
                                placeholder="Choisir un client..."
                            />
                            <button type="button" className="btn btn-sm btn-dark mt-2" onClick={() => setShowClientModal(true)}>+ Ajouter Client</button>
                            
                            <div className="mt-4">
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="row mt-2">
                                        <div className="col-6"><input className="form-control" placeholder="Désignation" value={item.designation} onChange={(e) => handleItemChange(idx, 'designation', e.target.value)} required /></div>
                                        <div className="col-3"><input className="form-control" type="number" placeholder="Qté" value={item.quantite} onChange={(e) => handleItemChange(idx, 'quantite', e.target.value)} required /></div>
                                        <div className="col-3"><input className="form-control" type="number" placeholder="PU" value={item.prix_unitaire} onChange={(e) => handleItemChange(idx, 'prix_unitaire', e.target.value)} required /></div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="btn btn-link" onClick={() => setFormData({...formData, items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]})}>+ Ajouter ligne</button>
                            <div className="h4 text-end mt-3">Total TTC: {formatPrix(formData.total_ttc)} F</div>
                            <button type="submit" className="btn btn-success mt-3">ENREGISTRER</button>
                            <button type="button" className="btn btn-secondary mt-3 ms-2" onClick={() => setView('list')}>Retour</button>
                        </form>
                    </div>
                )}
            </div>

            {/* MODAL CLIENT */}
            {showClientModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog"><div className="modal-content p-4">
                        <form onSubmit={handleQuickAddClient}>
                            <h5>Nouveau Client</h5>
                            <input className="form-control mb-2" placeholder="Nom" onChange={(e) => setNewClient({...newClient, nom: e.target.value})} required />
                            <input className="form-control mb-2" placeholder="Téléphone" onChange={(e) => setNewClient({...newClient, telephone: e.target.value})} />
                            <button type="submit" className="btn btn-success">Valider</button>
                            <button type="button" className="btn btn-light ms-2" onClick={() => setShowClientModal(false)}>Annuler</button>
                        </form>
                    </div></div>
                </div>
            )}
        </div>
    );
};

export default Facture;