import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/djago-logo.jpeg';
import select from 'react-select';

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
    
    // --- NOUVEL ÉTAT POUR LA RECHERCHE ---
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

    // --- LOGIQUE DE FILTRAGE ---
    const filteredFactures = factures.filter(f => {
        const clientNom = f.client?.nom?.toLowerCase() || "";
        const clientTel = f.client?.telephone?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return clientNom.includes(search) || clientTel.includes(search);
    });

    // --- CALCULS AUTOMATIQUES ---
    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => sum + (Number(item.quantite || 0) * Number(item.prix_unitaire || 0)), 0);
        const tva = ht * (Number(formData.tva_taux) / 100);
        setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (prix) => {
        return Number(prix)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    // --- GÉNÉRATION PDF PROFESSIONNELLE ---
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
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imgData = canvas.toDataURL("image/png");
                doc.addImage(imgData, 'PNG', 80, 35, 20, 20);
                buildPdfContent(doc, facture);
            };
        } else {
            buildPdfContent(doc, facture);
        }
    };

    const buildPdfContent = (doc, facture) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;
        const margin = 15;

        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = pageWidth - margin - logoWidth; 
        if (logo) {
            doc.addImage(logo, 'JPEG', logoX, 6, logoWidth, logoHeight);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(25, 135, 84); 
        doc.text("Djago", margin, 20);

        const djagoWidth = doc.getTextWidth("Djago");
        doc.setTextColor(233, 114, 35); 
        doc.text("Yelen", margin + djagoWidth, 20);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("Services Numériques & Gestion financière", margin, 26);

        doc.setDrawColor(233, 114, 35);
        doc.setLineWidth(0.5);
        doc.line(margin, 29, pageWidth - margin, 29);

        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("DÉTAILS DE LA FACTURE", margin, 40);
        doc.setFont("helvetica", "normal");
        doc.text(`Référence : ${facture.num_facture}`, margin, 46);
        doc.text(`Date : ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}`, margin, 51);

        const rightCol = 120;
        doc.setFont("helvetica", "bold");
        doc.text("CLIENT(E) :", rightCol, 40);
        doc.setFontSize(11);
        doc.setTextColor(10, 59, 47);
        doc.text(facture.client?.nom?.toUpperCase() || "CLIENT INCONNU", rightCol, 46);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(`Tél : ${facture.client?.telephone || 'N/A'}`, rightCol, 51);

        const items = facture.items || facture.lignes || [];
        const tableBody = items.map(item => [
            item.designation,
            item.quantite,
            `${formatPrix(item.prix_unitaire)} F CFA`,
            { content: `${formatPrix(item.quantite * item.prix_unitaire)} F CFA`, styles: { fontStyle: 'bold', align: 'center'} }
        ]);

        autoTable(doc, {
            startY: 65,
            head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Montant HT']],
            body: tableBody,
            foot: [
                ['', '', 'MONTANT TOTAL HT', `${formatPrix(facture.total_ht)} F CFA`],
                ['', '', 'TOTAL TTC', `${formatPrix(facture.total_ttc)} F CFA`]
            ],
            theme: 'grid', 
            styles: { lineColor: [200, 200, 200], lineWidth: 0.1, font: 'helvetica' },
            headStyles: { fillColor: [25, 135, 84], textColor: [255, 255, 255], halign: 'center' },
            footStyles: { fillColor: [233, 114, 35], textColor: [255, 255, 255], halign: 'right', fontStyle: 'bold' },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'right' } },
            margin: { left: margin, right: margin },
            showFoot: 'lastPage'
        });

        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(0);
        doc.text(
            `Délivrée le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString()}`, 
            pageWidth - margin, 
            doc.lastAutoTable.finalY + 12, 
            { align: 'right' }
        );

        const finalY = doc.lastAutoTable.finalY;
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Facture générée par DjagoYelen !", centerX, finalY + 20, { align: 'center' });

        doc.save(`Facture_${facture.num_facture}.pdf`);
    };

    const handleEdit = (facture) => {
        setIsEditing(true);
        setFormData({
            ...facture,
            client_id: facture.client_id || facture.client?.id,
            items: facture.items || facture.lignes || []
        });
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
            try {
                await api.delete(`/factures/${id}`);
                fetchData();
            } catch (error) { alert("Erreur de suppression"); }
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

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-success"></div></div>;

    return (
        <div className="p-2 p-md-4" style={{ backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            
            <div style={{ display: 'none' }}>
                {factures.map(f => (
                    <QRCodeSVG key={f.id} id={`qr-pdf-${f.id}`} value={`DjaGoYelen-FACTURATION\nFACTURE N°: ${f.num_facture}\nCLIENT: ${f.client?.nom}\nTel: ${f.client?.telephone}\nTOTAL: ${formatPrix(f.total_ttc)} F CFA\nDATE: ${new Date(f.date_emission).toLocaleDateString()}`} size={120} />
                ))}
            </div>

            <div className="container-fluid">
                {view === 'list' ? (
                    <div className="animate__animated animate__fadeIn">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 rounded shadow-sm gap-3">
                            <h2 style={{ color: colors.darkGreen }} className="mb-0 fw-bold fs-4">🧾 Gestion des Factures</h2>
                            
                            {/* --- BARRE DE RECHERCHE AJOUTÉE --- */}
                            <div className="d-flex gap-2 flex-grow-1 max-width-md-50" style={{ maxWidth: '400px' }}>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0" 
                                        placeholder="Nom ou téléphone client..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="btn text-white fw-bold shadow-sm" style={{ backgroundColor: colors.orange }}
                                onClick={() => { setIsEditing(false); setFormData(initialFormState); setView('form'); }}>
                                + Créer une Facture
                            </button>
                        </div>

                        <div className="card border-0 shadow-sm overflow-hidden text-start">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-3">N° Facture</th>
                                            <th>Client</th>
                                            <th>Date</th>
                                            <th>Montant TTC</th>
                                            <th className="text-end pe-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* UTILISATION DES FACTURES FILTRÉES ICI */}
                                        {filteredFactures.length > 0 ? (
                                            filteredFactures.map(f => (
                                                <tr key={f.id}>
                                                    <td className="ps-3 fw-bold">#{f.num_facture}</td>
                                                    <td>
                                                        <div className="fw-bold">{f.client?.nom}</div>
                                                        <small className="text-muted">{f.client?.telephone}</small>
                                                    </td>
                                                    <td>{new Date(f.date_emission).toLocaleDateString()}</td>
                                                    <td className="fw-bold text-success">{formatPrix(f.total_ttc)} F</td>
                                                    <td className="text-end pe-3">
                                                        <button className="btn btn-sm text-info mx-1" onClick={() => { setSelectedFacture(f); setShowDetailsModal(true); }}><i className="bi bi-eye-fill"></i></button>
                                                        <button className="btn btn-sm text-primary mx-1" onClick={() => handleEdit(f)}><i className="bi bi-pencil-square"></i></button>
                                                        <button className="btn btn-sm text-dark mx-1" onClick={() => generatePDF(f)}><i className="bi bi-download"></i></button>
                                                        <button className="btn btn-sm text-danger mx-1" onClick={() => handleDelete(f.id)}><i className="bi bi-trash-fill"></i></button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-muted">Aucune facture trouvée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card border-0 shadow p-3 p-md-4 text-start animate__animated animate__slideInRight">
                        <div className="d-flex justify-content-between mb-4">
                            <h3 className="fw-bold" style={{ color: colors.darkGreen }}>{isEditing ? 'Modifier Facture' : 'Nouvelle Facture'}</h3>
                            <button className="btn btn-outline-secondary" onClick={() => setView('list')}>Annuler</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Client</label>
                                    <div className="input-group">
                                        <select
                                            option={clients.map(c => ({ value: c.id, label: c.nom || c.name }))}
                                            onChange={(selected) => setFormData({ ...formData, client_id: selected.value })}
                                            placeholder="--client--"
                                            className="form-select shadow-none"
                                            required
                                        />
                                        <button type="button" className="btn btn-dark" onClick={() => setShowClientModal(true)}>+</button>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Date d'émission</label>
                                    <input type="date" className="form-control" value={formData.date_emission} onChange={(e) => setFormData({...formData, date_emission: e.target.value})} required />
                                </div>
                            </div>
                            <div className="mt-4">
                                <h6 className="fw-bold border-bottom pb-2">Articles</h6>
                                {formData.items.map((item, idx) => (
                                    <div key={idx} className="row g-2 mb-2 align-items-end">
                                        <div className="col-md-5"><input type="text" className="form-control" placeholder="Désignation" value={item.designation} onChange={(e) => handleItemChange(idx, 'designation', e.target.value)} required /></div>
                                        <div className="col-md-2"><input type="number" className="form-control" placeholder="Qté" value={item.quantite} onChange={(e) => handleItemChange(idx, 'quantite', e.target.value)} required /></div>
                                        <div className="col-md-4"><input type="number" className="form-control" placeholder="P.U." value={item.prix_unitaire} onChange={(e) => handleItemChange(idx, 'prix_unitaire', e.target.value)} required /></div>
                                        <div className="col-md-1"><button type="button" className="btn btn-outline-danger w-100" onClick={() => setFormData({...formData, items: formData.items.filter((_, i) => i !== idx)})} disabled={formData.items.length === 1}><i className="bi bi-x-lg"></i></button></div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-link p-0 text-decoration-none fw-bold mt-2" onClick={() => setFormData({...formData, items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]})}>+ Ajouter une ligne</button>
                            </div>
                            <div className="text-end mt-4 p-3 rounded bg-light border">
                                <h4 className="fw-bold mb-0" style={{ color: colors.orange }}>Total TTC : {formatPrix(formData.total_ttc)} F CFA</h4>
                            </div>
                            <button type="submit" className="btn btn-success w-100 mt-4 py-3 fw-bold">ENREGISTRER</button>
                        </form>
                    </div>
                )}
            </div>

            {/* MODALES */}
            {showClientModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 text-start shadow">
                            <div className="modal-header bg-dark text-white"><h5 className="modal-title">Nouveau Client</h5></div>
                            <form onSubmit={handleQuickAddClient}>
                                <div className="modal-body p-4">
                                    <div className="mb-3"><label className="form-label small fw-bold">Nom / Entreprise</label><input type="text" className="form-control" placeholder="Nom / Entreprise" onChange={(e) => setNewClient({...newClient, nom: e.target.value})} required /></div>
                                    <div className="mb-3"><label className="form-label small fw-bold">Téléphone</label><input type="text" className="form-control" placeholder="Téléphone" onChange={(e) => setNewClient({...newClient, telephone: e.target.value})} required /></div>
                                    <div className="mb-3"><label className="form-label small fw-bold">Email</label><input type="email" className="form-control" placeholder="Email" onChange={(e) => setNewClient({...newClient, email: e.target.value})} required /></div>
                                    <div className="mb-3"><label className="form-label small fw-bold">Adresse</label><input type="text" className="form-control" placeholder="Adresse" onChange={(e) => setNewClient({...newClient, adresse: e.target.value})} required /></div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-light" onClick={() => setShowClientModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-success w-100 mt-2 py-3 fw-bold">ENREGISTRER</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedFacture && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 text-start shadow-lg">
                            <div className="modal-header border-0 pb-0"><button className="btn-close" onClick={() => setShowDetailsModal(false)}></button></div>
                            <div className="modal-body p-4">
                                <div className="d-flex justify-content-between mb-4">
                                    <div><h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>Facture #{selectedFacture.num_facture}</h4>
                                        <small className="text-muted" style={{ color: colors.darkGreen}}><span className='fw-bold'>CLIENT :</span> {selectedFacture.client?.nom}</small><br />
                                        <small className="text-muted" style={{ color: colors.darkGreen}}><span className='fw-bold'>TEL :</span> {selectedFacture.client?.telephone}</small>
                                    </div>
                                    <div className="bg-white p-2 border rounded shadow-sm">
                                        <QRCodeSVG value={`Facture:${selectedFacture.num_facture}`} size={60} />
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead className="bg-light"><tr><th>Désignation</th><th className="text-center">Qté</th><th className="text-end">Total HT</th></tr></thead>
                                        <tbody>
                                            {(selectedFacture.items || selectedFacture.lignes || []).map((i, k) => (
                                                <tr key={k}><td>{i.designation}</td><td className="text-center">{i.quantite}</td><td className="text-end">{formatPrix(i.quantite * i.prix_unitaire)} F</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="text-end mt-3"><h3 className="fw-bold text-success">TOTAL : {formatPrix(selectedFacture.total_ttc)} F CFA</h3></div>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-dark" onClick={() => generatePDF(selectedFacture)}>Télécharger PDF</button>
                                <button className="btn btn-outline-secondary" onClick={() => setShowDetailsModal(false)}>Fermer</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Facture;