import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select'; // Importation nécessaire

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
        } catch (error) { console.error("Erreur:", error); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- CALCULS & LOGIQUE ---
    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => sum + (Number(item.quantite || 0) * Number(item.prix_unitaire || 0)), 0);
        const tva = ht * (Number(formData.tva_taux) / 100);
        setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (prix) => Number(prix).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const generatePDF = (facture) => { /* Votre logique existante inchangée */ };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await api.put(`/factures/${formData.id}`, formData);
            else await api.post('/factures', formData);
            setView('list');
            setFormData(initialFormState);
            fetchData();
        } catch (error) { alert("Erreur d'enregistrement"); }
    };

    const handleItemChange = (idx, field, val) => {
        const newItems = [...formData.items];
        newItems[idx][field] = field === 'designation' ? val : (val === '' ? 0 : Number(val));
        setFormData({ ...formData, items: newItems });
    };

    // --- RENDU ---
    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="p-2 p-md-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            <div className="container-fluid">
                {view === 'list' ? (
                    /* Votre liste existante */
                    <div className="card shadow-sm p-3">
                        <button className="btn btn-primary" onClick={() => setView('form')}>+ Créer</button>
                        {/* Votre tableau ici */}
                    </div>
                ) : (
                    <div className="card shadow p-4">
                        <h3>{isEditing ? 'Modifier' : 'Nouvelle'} Facture</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="fw-bold">Client</label>
                                <div className="d-flex gap-2">
                                    <div style={{ flexGrow: 1 }}>
                                        {/* CORRECTION : Remplacement du select par Select */}
                                        <Select
                                            options={clients.map(c => ({ value: c.id, label: c.nom }))}
                                            value={clients.find(c => c.id === formData.client_id) ? 
                                                { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                                            onChange={(selected) => setFormData({ ...formData, client_id: selected?.value })}
                                            placeholder="-- Sélectionnez un client --"
                                            isSearchable
                                            required
                                        />
                                    </div>
                                    <button type="button" className="btn btn-dark" onClick={() => setShowClientModal(true)}>+</button>
                                </div>
                            </div>
                            {/* Reste de votre formulaire existant intact */}
                            <button type="submit" className="btn btn-success w-100 mt-3">ENREGISTRER</button>
                        </form>
                    </div>
                )}
            </div>
            {/* Vos modales restent inchangées */}
        </div>
    );
};

export default Facture;