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
        if (svgElement) {
            const canvas = document.createElement("canvas");
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svg64 = btoa(unescape(encodeURIComponent(svgData)));
            const img = new Image();
            img.src = `data:image/svg+xml;base64,${svg64}`;
            img.onload = () => {
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                doc.addImage(canvas.toDataURL("image/png"), 'PNG', 80, 35, 20, 20);
                buildPdfContent(doc, facture);
            };
        } else { buildPdfContent(doc, facture); }
    };

    const buildPdfContent = (doc, facture) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        if (logo) doc.addImage(logo, 'JPEG', pageWidth - margin - 25, 6, 25, 25);
        
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(25, 135, 84); 
        doc.text("Djago", margin, 20);
        doc.setTextColor(233, 114, 35); doc.text("Yelen", margin + doc.getTextWidth("Djago"), 20);
        doc.setFontSize(9); doc.setTextColor(100); doc.text("Services Numériques & Gestion financière", margin, 26);
        doc.setDrawColor(233, 114, 35); doc.line(margin, 29, pageWidth - margin, 29);

        doc.setFontSize(10); doc.setTextColor(0); doc.setFont("helvetica", "bold");
        doc.text("DÉTAILS DE LA FACTURE", margin, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`Référence : ${facture.num_facture}`, margin, 46);
        doc.text(`Date : ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}`, margin, 51);

        doc.text(facture.client?.nom?.toUpperCase() || "CLIENT INCONNU", 120, 46);
        
        autoTable(doc, {
            startY: 65,
            head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Montant HT']],
            body: (facture.items || facture.lignes || []).map(i => [i.designation, i.quantite, `${formatPrix(i.prix_unitaire)} F`, `${formatPrix(i.quantite * i.prix_unitaire)} F`]),
            foot: [['', '', 'TOTAL HT', `${formatPrix(facture.total_ht)} F`], ['', '', 'TOTAL TTC', `${formatPrix(facture.total_ttc)} F`]],
            theme: 'grid',
            headStyles: { fillColor: [25, 135, 84] }
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
            isEditing ? await api.put(`/factures/${formData.id}`, formData) : await api.post('/factures', formData);
            setView('list'); setFormData(initialFormState); fetchData();
        } catch (e) { alert("Erreur d'enregistrement"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ?")) { await api.delete(`/factures/${id}`); fetchData(); }
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
        setShowClientModal(false);
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <div className="p-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            <div style={{ display: 'none' }}>
                {factures.map(f => <QRCodeSVG key={f.id} id={`qr-pdf-${f.id}`} value={f.num_facture} />)}
            </div>

            {view === 'list' ? (
                <div>
                    <input className="form-control mb-3" placeholder="Rechercher..." onChange={(e) => setSearchTerm(e.target.value)} />
                    <button className="btn btn-primary" onClick={() => { setIsEditing(false); setView('form'); }}>+ Créer</button>
                    <table className="table mt-3 bg-white">
                        <thead><tr><th>N°</th><th>Client</th><th>Montant</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredFactures.map(f => (
                                <tr key={f.id}>
                                    <td>#{f.num_facture}</td>
                                    <td>{f.client?.nom}</td>
                                    <td>{formatPrix(f.total_ttc)} F</td>
                                    <td>
                                        <button className="btn btn-sm btn-info" onClick={() => { setSelectedFacture(f); setShowDetailsModal(true); }}>Voir</button>
                                        <button className="btn btn-sm btn-primary mx-2" onClick={() => handleEdit(f)}>Éditer</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>Supprimer</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white p-4 shadow">
                    <h3>{isEditing ? 'Modifier' : 'Nouvelle'} Facture</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Client</label>
                        <div className="d-flex gap-2">
                            <Select
                                options={clients.map(c => ({ value: c.id, label: c.nom }))}
                                value={clients.find(c => c.id === formData.client_id) ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                                onChange={(s) => setFormData({ ...formData, client_id: s?.value })}
                                className="flex-grow-1"
                            />
                            <button type="button" className="btn btn-dark" onClick={() => setShowClientModal(true)}>+</button>
                        </div>
                        {formData.items.map((item, idx) => (
                            <div key={idx} className="row mt-2">
                                <div className="col-5"><input className="form-control" placeholder="Désignation" value={item.designation} onChange={(e) => handleItemChange(idx, 'designation', e.target.value)} /></div>
                                <div className="col-3"><input className="form-control" type="number" value={item.quantite} onChange={(e) => handleItemChange(idx, 'quantite', e.target.value)} /></div>
                                <div className="col-4"><input className="form-control" type="number" value={item.prix_unitaire} onChange={(e) => handleItemChange(idx, 'prix_unitaire', e.target.value)} /></div>
                            </div>
                        ))}
                        <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={() => setFormData({...formData, items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]})}>+ Ligne</button>
                        <h4 className="mt-3">Total TTC: {formatPrix(formData.total_ttc)} F</h4>
                        <button type="submit" className="btn btn-success w-100">Enregistrer</button>
                    </form>
                </div>
            )}

            {/* MODALES */}
            {showClientModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog"><div className="modal-content p-4">
                        <h5>Nouveau Client</h5>
                        <input className="form-control mb-2" placeholder="Nom" onChange={e => setNewClient({...newClient, nom: e.target.value})} />
                        <button className="btn btn-success" onClick={handleQuickAddClient}>Ajouter</button>
                        <button className="btn btn-link" onClick={() => setShowClientModal(false)}>Fermer</button>
                    </div></div>
                </div>
            )}

            {showDetailsModal && selectedFacture && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg"><div className="modal-content p-4">
                        <h5>Facture #{selectedFacture.num_facture}</h5>
                        <button className="btn btn-dark" onClick={() => generatePDF(selectedFacture)}>Télécharger PDF</button>
                        <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                    </div></div>
                </div>
            )}
        </div>
    );
};

export default Facture;