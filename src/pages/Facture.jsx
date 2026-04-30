import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select'; // Importation correcte

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

    const colors = {
        darkGreen: '#0A3B2F',
        successGreen: '#198754',
        orange: '#E97223',
        lightBg: '#f4f7f6'
    };

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

    const filteredFactures = factures.filter(f => {
        const clientNom = f.client?.nom?.toLowerCase() || "";
        const clientTel = f.client?.telephone?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return clientNom.includes(search) || clientTel.includes(search);
    });

    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => sum + (Number(item.quantite || 0) * Number(item.prix_unitaire || 0)), 0);
        const tva = ht * (Number(formData.tva_taux) / 100);
        setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (prix) => Number(prix).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const generatePDF = (facture) => {
        const doc = new jsPDF();
        const svgElement = document.getElementById(`qr-pdf-${facture.id}`);
        // Logique simplifiée pour l'exemple (supprimez le canvas si non nécessaire)
        buildPdfContent(doc, facture);
    };

    const buildPdfContent = (doc, facture) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        doc.setFont("helvetica", "bold");
        doc.text("Facture", margin, 20);
        autoTable(doc, {
            startY: 40,
            head: [['Désignation', 'Qté', 'PU', 'Total']],
            body: (facture.items || []).map(i => [i.designation, i.quantite, i.prix_unitaire, i.quantite * i.prix_unitaire])
        });
        doc.save(`Facture_${facture.num_facture}.pdf`);
    };

    const handleEdit = (facture) => {
        setIsEditing(true);
        setFormData({ ...facture, client_id: facture.client_id || facture.client?.id, items: facture.items || facture.lignes || [] });
        setView('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) await api.put(`/factures/${formData.id}`, formData);
            else await api.post('/factures', formData);
            setView('list');
            setFormData(initialFormState);
            fetchData();
        } catch (error) { alert("Erreur lors de l'enregistrement"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette facture ?")) {
            await api.delete(`/factures/${id}`);
            fetchData();
        }
    };

    const handleItemChange = (idx, field, val) => {
        const newItems = [...formData.items];
        newItems[idx][field] = field === 'designation' ? val : (val === '' ? 0 : Number(val));
        setFormData({ ...formData, items: newItems });
    };

    const handleQuickAddClient = async (e) => {
        e.preventDefault();
        const res = await api.post('/clients', newClient);
        setClients([...clients, res.data]);
        setFormData({ ...formData, client_id: res.data.id });
        setShowClientModal(false);
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <div className="p-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {view === 'list' ? (
                <div>
                    <div className="d-flex justify-content-between mb-4">
                        <h2>Gestion des Factures</h2>
                        <button className="btn btn-primary" onClick={() => setView('form')}>+ Créer</button>
                    </div>
                    <table className="table bg-white">
                        <thead><tr><th>N°</th><th>Client</th><th>Total</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredFactures.map(f => (
                                <tr key={f.id}>
                                    <td>{f.num_facture}</td>
                                    <td>{f.client?.nom}</td>
                                    <td>{formatPrix(f.total_ttc)} F</td>
                                    <td><button onClick={() => handleEdit(f)}>Éditer</button><button onClick={() => handleDelete(f.id)}>Supprimer</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white p-4">
                    <div className="mb-3">
                        <label>Client</label>
                        <Select
                            options={clients.map(c => ({ value: c.id, label: c.nom }))}
                            value={clients.find(c => c.id === formData.client_id) ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                            onChange={(selected) => setFormData({ ...formData, client_id: selected?.value })}
                            placeholder="Sélectionner un client"
                            required
                        />
                    </div>
                    {/* ... autres champs du formulaire ... */}
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                </form>
            )}
        </div>
    );
};

export default Facture;