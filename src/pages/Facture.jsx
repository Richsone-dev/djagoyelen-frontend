import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select'; // Importation corrigée

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

    // --- CHARGEMENT ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resFactures, resClients] = await Promise.all([api.get('/factures'), api.get('/clients')]);
            setFactures(Array.isArray(resFactures.data) ? resFactures.data : []);
            setClients(Array.isArray(resClients.data) ? resClients.data : []);
        } catch (error) { console.error("Erreur chargement:", error); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- LOGIQUE ---
    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => sum + (Number(item.quantite || 0) * Number(item.prix_unitaire || 0)), 0);
        const tva = ht * (Number(formData.tva_taux) / 100);
        setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (p) => Number(p).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            isEditing ? await api.put(`/factures/${formData.id}`, formData) : await api.post('/factures', formData);
            setView('list');
            setFormData(initialFormState);
            fetchData();
        } catch (e) { alert("Erreur d'enregistrement"); }
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
        } catch (e) { alert("Erreur ajout client"); }
    };

    // --- RENDU ---
    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <div className="p-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {view === 'list' ? (
                <div>
                    <input className="form-control mb-3" placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => { setIsEditing(false); setFormData(initialFormState); setView('form'); }}>+ Créer</button>
                    <table className="table mt-3 bg-white">
                        <thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Actions</th></tr></thead>
                        <tbody>
                            {factures.filter(f => f.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                                <tr key={f.id}>
                                    <td>{f.num_facture}</td>
                                    <td>{f.client?.nom}</td>
                                    <td>{formatPrix(f.total_ttc)} F</td>
                                    <td>
                                        <button className="btn btn-sm btn-info" onClick={() => { setSelectedFacture(f); setShowDetailsModal(true); }}>Voir</button>
                                        <button className="btn btn-sm btn-danger ms-2" onClick={() => api.delete(`/factures/${f.id}`).then(fetchData)}>X</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-4 shadow-sm">
                    <h3>{isEditing ? 'Modifier' : 'Nouvelle'} Facture</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label>Client</label>
                            <div className="d-flex gap-2">
                                <div style={{ flexGrow: 1 }}>
                                    <Select
                                        options={clients.map(c => ({ value: c.id, label: c.nom }))}
                                        value={clients.find(c => c.id === formData.client_id) ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                                        onChange={(s) => setFormData({ ...formData, client_id: s?.value })}
                                        placeholder="Sélectionner..."
                                    />
                                </div>
                                <button type="button" className="btn btn-dark" onClick={() => setShowClientModal(true)}>+</button>
                            </div>
                        </div>
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="row mb-2">
                                <div className="col-5"><input className="form-control" placeholder="Désignation" value={item.designation} onChange={(e) => handleItemChange(idx, 'designation', e.target.value)} /></div>
                                <div className="col-3"><input type="number" className="form-control" value={item.quantite} onChange={(e) => handleItemChange(idx, 'quantite', e.target.value)} /></div>
                                <div className="col-4"><input type="number" className="form-control" value={item.prix_unitaire} onChange={(e) => handleItemChange(idx, 'prix_unitaire', e.target.value)} /></div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFormData({...formData, items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]})}>+ Ligne</button>
                        <h5 className="mt-3">Total TTC: {formatPrix(formData.total_ttc)} F</h5>
                        <button type="submit" className="btn btn-success w-100">Enregistrer</button>
                    </form>
                </div>
            )}

            {/* MODALES */}
            {showClientModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog"><div className="modal-content p-4">
                        <form onSubmit={handleQuickAddClient}>
                            <h5>Nouveau Client</h5>
                            <input className="form-control mb-2" placeholder="Nom" onChange={e => setNewClient({...newClient, nom: e.target.value})} required />
                            <input className="form-control mb-2" placeholder="Téléphone" onChange={e => setNewClient({...newClient, telephone: e.target.value})} />
                            <button className="btn btn-success w-100">Ajouter</button>
                            <button type="button" className="btn btn-link" onClick={() => setShowClientModal(false)}>Fermer</button>
                        </form>
                    </div></div>
                </div>
            )}

            {showDetailsModal && selectedFacture && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog"><div className="modal-content p-4">
                        <h5>Détails Facture #{selectedFacture.num_facture}</h5>
                        <p>Client: {selectedFacture.client?.nom}</p>
                        <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                    </div></div>
                </div>
            )}
        </div>
    );
};

export default Facture;