import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import logo from '../assets/djago-logo.jpeg';



const Facture = () => {
    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    const [newClient, setNewClient] = useState({
        nom: '', email: '', telephone: '', adresse: ''
    });


    const colors = {
        darkGreen: '#0A3B2F',
        red1: '#FF0000',
        orange: '#E97223',
        successGreen: '#198754',
        blue: '#2196f3',
        purple: '#9c27b0',
        lightGray: '#f8f9fa',
        bgLight: '#f8f9fa',
        redLight: '#f8d7da',
        greenLight: '#d1e7dd',
        purpleLight: '#f3ccff',
        orangeLight: '#fff3cd',
        yellowLight: '#fff9db',
        orangeHover: '#ff7f50',
        dangerRed: '#dc3545'
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

    useEffect(() => {
        fetchFactures();
        fetchClients();
    }, []);

    // ✅ Calcul automatique HT / TTC
    useEffect(() => {
        const ht = formData.items.reduce((sum, item) => {
            const qte = Number(item.quantite) || 0;
            const pu = Number(item.prix_unitaire) || 0;
            return sum + qte * pu;
        }, 0);

        const tva = ht * (Number(formData.tva_taux) / 100);
        const ttc = ht + tva;

        setFormData(prev => {
            if (prev.total_ht === ht && prev.total_ttc === ttc) return prev;
            return { ...prev, total_ht: parseFloat(ht.toFixed(2)), total_ttc: parseFloat(ttc.toFixed(2)) };
        });
    }, [formData.items, formData.tva_taux]);

    // ─────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────
    const fetchFactures = async () => {
        try {
            const res = await api.get('/factures');
            // Laravel retourne souvent { data: [...] } avec pagination, ou directement un tableau
            setFactures(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (e) {
            console.error('Erreur fetchFactures:', e.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients');
            setClients(Array.isArray(res.data) ? res.data : res.data.data || []);
        } catch (e) {
            console.error('Erreur fetchClients:', e.response?.data || e.message);
        }
    };

    // ─────────────────────────────────────────
    // AJOUTER CLIENT
    // ─────────────────────────────────────────
    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/clients', newClient);
            // Laravel retourne souvent { data: {...} } ou directement l'objet
            const created = res.data.data || res.data;
            setClients(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, client_id: created.id }));
            setShowClientModal(false);
            setNewClient({ nom: '', email: '', telephone: '', adresse: '' });
        } catch (e) {
            console.error('Erreur addClient:', e.response?.data || e.message);
            alert("Erreur lors de l'ajout du client : " + (e.response?.data?.message || e.message));
        }
    };

    // ─────────────────────────────────────────
    // SUBMIT FACTURE — correction principale
    // ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSubmitLoading(true);

        // Validation côté client
        if (!formData.client_id) {
            setErrors({ client_id: 'Veuillez sélectionner un client.' });
            setSubmitLoading(false);
            return;
        }

        const hasEmptyItem = formData.items.some(i => !i.designation.trim());
        if (hasEmptyItem) {
            setErrors({ items: 'Chaque ligne doit avoir une désignation.' });
            setSubmitLoading(false);
            return;
        }

        // ✅ Payload propre pour Laravel
        // Laravel s'attend à des types corrects, les items sont souvent envoyés
        // en JSON ou comme tableau imbriqué selon votre contrôleur
        const payload = {
            client_id:     parseInt(formData.client_id),
            date_emission: formData.date_emission,
            tva_taux:      parseFloat(formData.tva_taux),
            total_ht:      parseFloat(formData.total_ht),
            total_ttc:     parseFloat(formData.total_ttc),
            items: formData.items.map(item => ({
                designation:   String(item.designation || '').trim(),
                quantite:      parseInt(item.quantite || 0),
                prix_unitaire: parseFloat(item.prix_unitaire || 0)
            }))
        };

        try {
            if (isEditing && formData.id) {
                // ✅ Laravel : PUT ou PATCH selon votre route
                await api.put(`/factures/${formData.id}`, payload);
            } else {
                await api.post('/factures', payload);
            }

            setShowModal(false);
            setFormData(initialFormState);
            setIsEditing(false);
            await fetchFactures();

        } catch (err) {
            console.error('Erreur submit:', err.response?.data || err.message);

            // ✅ Laravel retourne les erreurs de validation sous err.response.data.errors
            if (err.response?.status === 422) {
                const laravelErrors = err.response.data.errors || {};
                // Convertir { 'items.0.designation': [...] } en messages lisibles
                const flat = {};
                Object.entries(laravelErrors).forEach(([key, msgs]) => {
                    flat[key] = Array.isArray(msgs) ? msgs[0] : msgs;
                });
                setErrors(flat);
            } else {
                alert("Erreur serveur : " + (err.response?.data?.message || err.message));
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ─────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────
    const handleDelete = async (id) => {
    // 1. Vérification de la confirmation
    const result = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Cette action est irréversible !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33', // Assure-toi que cette couleur est définie
        cancelButtonColor: '#6c757d',
        cancelButtonText: 'Annuler',
        confirmButtonText: 'Oui, supprimer'
    });

    if (result.isConfirmed) {
        try {
            // 2. Appel API
            await api.delete(`/factures/${id}`);
            
            // 3. Mise à jour optimisée de l'interface (plus rapide que fetchData())
            setFactures(prevFactures => prevFactures.filter(f => f.id !== id));
            
            // 4. Feedback utilisateur
            await Swal.fire('Supprimé !', 'La facture a été supprimée avec succès.', 'success');
        } catch (err) {
            console.error("Erreur suppression:", err);
            // Affichage du message d'erreur spécifique si disponible
            const errorMessage = err.response?.data?.message || "Impossible de supprimer la facture.";
            Swal.fire('Erreur', errorMessage, 'error');
        }
    }
};


    // ─────────────────────────────────────────
    // MODIFIER ITEM
    // ─────────────────────────────────────────
    const handleItemChange = (index, field, value) => {
        const items = [...formData.items];
        items[index] = {
            ...items[index],
            [field]: field === 'designation' ? value : Number(value)
        };
        setFormData(prev => ({ ...prev, items }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { designation: '', quantite: 1, prix_unitaire: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // ─────────────────────────────────────────
    // PDF
    // ─────────────────────────────────────────

    // ✅ FORMAT PRIX PRO (20 000)
// ✅ FORMAT PRIX PRO (23 000)
const formatPrix = (value, separator = ' ') => {
    if (isNaN(value)) return '0';

    return Number(value)
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

const generatePDF = async (facture) => {
    try {
    const res = await api.get(`/factures/${facture.id}`);
    const fullFacture = res.data.data || res.data;

    const doc = new jsPDF();
    const numFacture = fullFacture.numero_facture || fullFacture.id;

    // 🎨 Couleurs
    const successGreen = [25, 135, 84];
    const orange = [233, 114, 35];

    // ─────────────────────────────
    // 🧾 HEADER ALIGNÉ PRO
    // ─────────────────────────────
    const headerY = 30;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");

    // Texte DjagoYelen
    doc.setTextColor(...successGreen);
    doc.text("Djago", 14, headerY - 4);

    const widthDjago = doc.getTextWidth("Djago");

    doc.setTextColor(...orange);
    // On utilise l'espacement calculé pour coller "Yelen" après "Djago"
    doc.text("Yelen", 14 + widthDjago, headerY - 4); 
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(8);
    doc.text('Services Numériques & Gestion financière', 14, headerY +2);

        // 🖼️ Logo aligné horizontalement
        try {
            doc.addImage(logo, 'JPEG', 165, headerY - 22, 30, 30);
        } catch {
            console.warn("Logo non chargé");
        }

        // 🟩 Ligne horizontale sous header
        doc.setDrawColor(...orange);
        doc.setLineWidth(0.3);
        doc.line(14, headerY + 5, 196, headerY + 5);

        // ─────────────────────────────
        // 📄 INFOS FACTURE
        // ─────────────────────────────
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`DETAILS DE LA FACTURE`,14, 45);

        doc.setFont("helvetica", "normal");
        doc.text(`Référence : ${numFacture}`, 14, 50);
        doc.text(`Date : ${fullFacture.date_emission || '-'}`, 14, 55);

        doc.setFont("helvetica", "bold");
        doc.text(`STATUT: Payé`, 14, 60);

        doc.setFont("helvetica", "bold");
        doc.text(`CLIENT`, 130, 45);
        doc.setFont("helvetica", "bold");
        // 2. Récupérer le nom et le transformer en majuscules
        const nomClient = (fullFacture.client_nom || fullFacture.client?.nom || '---').toUpperCase();
        
        doc.text(`${nomClient}`, 130, 50);
        doc.setFont("helvetica", "normal");
        doc.text(`Tél : ${fullFacture.client?.telephone || '---'}`, 130, 55);
        doc.text(`Email : ${fullFacture.client?.email || '---'}`, 130, 60);
        

        // ─────────────────────────────
        // 📦 ITEMS
        // ─────────────────────────────
        let items = [];

        if (fullFacture.lignes) {
            items = fullFacture.lignes;
        } else if (typeof fullFacture.items === 'string') {
            try {
                items = JSON.parse(fullFacture.items);
            } catch {
                items = [];
            }
        } else {
            items = fullFacture.items || [];
        }

        // ─────────────────────────────
        // 📊 TABLE DATA
        // ─────────────────────────────
        const rows = items.map(i => {
            const qte = Number(i.quantite || 0);
            const pu = Number(i.prix_unitaire || i.prix || 0);

            return [
                i.designation || i.description || 'N/A',
                qte,
                `${formatPrix(pu)} F`,
                `${formatPrix(qte * pu)} F`
            ];
        });

        // ─────────────────────────────
        // 📊 TABLEAU
        // ─────────────────────────────
        autoTable(doc, {
            startY: 65,
            head: [['Désignation', 'Quantité', 'Prix Unitaire', 'Montant']],
            body: rows,
            foot: [
                ['', '', 'Total HT', `${formatPrix(fullFacture.total_ht)} F`],
                ['', '', `TVA (${fullFacture.tva_taux || 18}%)`,
                    `${formatPrix(fullFacture.total_ttc - fullFacture.total_ht)} F`
                ],
                ['', '', 'TOTAL TTC', `${formatPrix(fullFacture.total_ttc)} F`]
            ],
            theme: 'grid',
            styles: {
                lineColor: [230,230,230],
                lineWidth: 0.1,
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'center' },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' }
            },
            headStyles: {
                fillColor: successGreen,
                textColor: 255,
                fontStyle: 'bold',
                textAlign: 'center'
            },
            footStyles: {
              lineWidth: 0,
              fillColor: orange,
              textColor: 255,
                fontStyle: 'bold',
                textAlign: 'center'
            }
          });
          // ─────────────────────────────
          // 📝 FOOTER
          // ─────────────────────────────
          const finalY = doc.lastAutoTable.finalY || 100;

          doc.setFontSize(8);
          doc.setTextColor(120);
          doc.setFont('times', 'italic');
          doc.text("Factrure générée par DjagoYelen", 14, finalY + 10);
          // 🖼️ Logo avec opacité réduite (Correction sécurisée)
            {/*try {
                // Vérifier si GState est disponible pour éviter le crash
                if (typeof doc.GState === 'function') {
                    const gs1 = new doc.GState({ opacity: 0.3 });
                    doc.setGState(gs1);
                    doc.addImage(logo, 'PNG', 20, finalY + 15, 20, 20);
                    // Toujours remettre l'opacité à 1.0
                    doc.setGState(new doc.GState({ opacity: 1.0 }));
                } else {
                    // Fallback : affiche le logo normalement si GState n'est pas supporté
                    doc.addImage(logo, 'PNG', 20, finalY + 15, 5, 5);
                }
            } catch (error) {
                console.warn("Erreur lors de l'insertion du logo :", error);
            }*/}

        // ─────────────────────────────
        // 📱 QR CODE
        // ─────────────────────────────
        const qrData = `
DjagoYelen FACTURATION
Facture: ${numFacture}
Client: ${fullFacture.client?.nom}
Tél: ${fullFacture.client?.telephone}
Email: ${fullFacture.client?.email}
Total TTC: ${formatPrix(fullFacture.total_ttc)} F
Date: ${fullFacture.date_emission}
        `;

        const qrImage = await QRCode.toDataURL(qrData);

        doc.addImage(qrImage, 'PNG', 100, 37, 25, 25);


        // ─────────────────────────────
        // 💾 EXPORT
        // ─────────────────────────────
        doc.save(`Facture_${numFacture}.pdf`);

    } catch (error) {
        console.error("Erreur PDF:", error);
        alert("Impossible de générer le PDF");
    }
};

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh', backgroundColor: colors.lightGray}}>
                <div className="spinner-border" style={{ color: colors.orange }} role="status">
                    <span className="visually-hidden">Chargement des factures...</span>
                </div>
            </div>
        );
    }

    const fieldConfig = {
        nom: { placeholder: "Ex: Jean Dupont", type: "text" },
        email: { placeholder: "Ex: jean@exemple.com", type: "email" },
        telephone: { placeholder: "Ex: 70 00 00 00", type: "tel" },
        adresse: { placeholder: "Ex: Bobo-Dioulasso, Burkina Faso", type: "text" }
    };


    return (
        <div className="container p-3 mb-5">

            {/* ── MODAL CLIENT ── */}
            {showClientModal && (
                <div className="modal show d-block text-align-left" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content text-align-left">
                            <div className="modal-header">
                                <h5 className="modal-title">Nouveau Client</h5>
                                <button className="btn-close" onClick={() => setShowClientModal(false)} />
                            </div>
                            <form onSubmit={handleAddClient}>
            <div className="modal-body" style={{ textAlign: 'left' }}>
                {Object.keys(fieldConfig).map(field => (
                    <div className="mb-2" key={field}>
                        <label className="form-label text-capitalize">{field}</label>
                        <input
                            type={fieldConfig[field].type}
                            className="form-control"
                            value={newClient[field] || ''}
                            onChange={e => setNewClient(p => ({ ...p, [field]: e.target.value }))}
                            required={field === 'nom'}
                            placeholder={fieldConfig[field].placeholder}
                        />
                    </div>
                ))}
            </div>
            <div className="modal-footer">
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowClientModal(false)}
                >
                    Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                    Enregistrer
                </button>
            </div>
        </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LISTE ── */}
            {!showModal ? (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="mb-0">Factures</h3>
                        <button className="btn btn-primary" onClick={() => {
                            setFormData(initialFormState);
                            setIsEditing(false);
                            setErrors({});
                            setShowModal(true);
                        }}>
                            + Nouvelle facture
                        </button>
                    </div>

                    {factures.length === 0 ? (
                        <p className="text-muted">Aucune facture enregistrée.</p>
                    ) : (
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                              <thead className="bg-green text-white">
                                  <tr>
                                      <th>N°</th>
                                      <th>Client</th>
                                      <th className="d-none d-md-table-cell">Date</th>
                                      <th>Total TTC</th>
                                      <th className="text-end">Actions</th>
                                  </tr>
                              </thead>

                              <tbody>
                                  {factures.length === 0 ? (
                                      <tr>
                                          <td colSpan="5" className="text-center py-4 text-muted">
                                              Aucune facture disponible
                                          </td>
                                      </tr>
                                  ) : (
                                      factures.map(f => (
                                          <tr key={f.id}>

                                              {/* N° */}
                                              <td className="fw-bold text-primary">
                                                  #{f.numero_facture || f.num_facture || f.id}
                                              </td>

                                              {/* Client + date mobile */}
                                              <td>
                                                  <div className="fw-semibold">
                                                      {f.client?.nom || '-'}
                                                  </div>

                                                  {/* Date visible seulement mobile */}
                                                  <small className="text-muted d-md-none">
                                                      {f.date_emission || '-'}
                                                  </small>
                                              </td>

                                              {/* Date desktop */}
                                              <td className="d-none d-md-table-cell">
                                                  {f.date_emission || '-'}
                                              </td>

                                              {/* Total */}
                                              <td className="fw-bold text-success">
                                                  {formatPrix(f.total_ttc)} F
                                              </td>

                                              {/* Actions */}
                                              <td className="text-end">
                                                  <div className="btn-group">

                                                      {/* PDF */}
                                                      <button
                                                          className="btn btn-sm btn-outline-success"
                                                          title="Télécharger PDF"
                                                          onClick={() => generatePDF(f)}
                                                      >
                                                          <i className="bi bi-file-earmark-pdf"></i>
                                                      </button>

                                                      {/* Modifier */}
                                                      <button
                                                          className="btn btn-sm btn-outline-warning"
                                                          title="Modifier"
                                                          onClick={() => {
                                                              setIsEditing(true);
                                                              setErrors({});

                                                              const items = typeof f.items === 'string'
                                                                  ? JSON.parse(f.items)
                                                                  : f.items || initialFormState.items;

                                                              setFormData({ ...f, items });
                                                              setShowModal(true);
                                                          }}
                                                      >
                                                          <i className="bi bi-pencil-square"></i>
                                                      </button>

                                                      {/* Supprimer */}
                                                      <button
                                                          className="btn btn-sm btn-outline-danger"
                                                          title="Supprimer"
                                                          onClick={() => handleDelete(f.id)}
                                                      >
                                                          <i className="bi bi-trash"></i>
                                                      </button>

                                                  </div>
                                              </td>

                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                          
                      </div>
                    )}
                </>
            ) : (
                // ── FORMULAIRE ──
                <form onSubmit={handleSubmit} className='mb-10' style={{textAlign: 'left'}}>
                    <div className="d-flex justify-content-between align-items-center mb-10 text-align-left">
                        <button type="button" className="btn btn-secondary" onClick={() => {
                            setShowModal(false);
                            setErrors({});
                        }}>
                            ← Retour
                        </button>
                        <h4>{isEditing ? 'Modifier la facture' : 'Nouvelle facture'}</h4>
                    </div>

                    {/* Client */}
                    <div className="mb-3">
                        <label className="form-label">Client <span className="text-danger"  style={{color: colors.dangerRed}}>*</span></label>
                        <div className="d-flex gap-2">
                            <select
                                className={`form-control ${errors.client_id ? 'is-invalid' : ''}`}
                                value={formData.client_id}
                                onChange={e => setFormData(p => ({ ...p, client_id: Number(e.target.value) }))}
                            >
                                <option value="">-- Choisir un client --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                            <button type="button" className="btn btn-outline-primary text-nowrap"
                                onClick={() => setShowClientModal(true)}>
                                + Nouveau
                            </button>
                        </div>
                        {errors.client_id && <div className="text-danger small mt-1">{errors.client_id}</div>}
                    </div>

                    {/* Date */}
                    <div className="mb-3">
                        <label className="form-label">Date d'émission</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date_emission}
                            onChange={e => setFormData(p => ({ ...p, date_emission: e.target.value }))} disabled
                        />
                    </div>

                    {/* Taux TVA */}
                    <div className="mb-3">
                        <label className="form-label">Taux TVA (%)</label>
                        <input
                            type="number"
                            className="form-control"
                            style={{ maxWidth: 120 }}
                            value={formData.tva_taux}
                            min={0}
                            onChange={e => setFormData(p => ({ ...p, tva_taux: Number(e.target.value) }))}
                        />
                    </div>

                    {/* Lignes */}
                    <label className="form-label fw-bold">Lignes de facturation</label>
                    {errors.items && <div className="text-danger small mb-2">{errors.items}</div>}

                    {formData.items.map((item, i) => (
                        <div key={i} className="border rounded p-3 mb-2 bg-light">
                            <div className="row g-2 align-items-center">
                                <div className="col-12 col-md-5 d-flex flex-column text-align-start">
                                    <label className="form-label">Designation : <span className="text-danger"  style={{color: colors.dangerRed}}>*</span></label>
                                    <input
                                        className={`form-control ${errors[`items.${i}.designation`] ? 'is-invalid' : ''}`}
                                        placeholder="Désignation"
                                        value={item.designation}
                                        onChange={e => handleItemChange(i, 'designation', e.target.value)}
                                    />
                                    {errors[`items.${i}.designation`] && (
                                        <div className="invalid-feedback">{errors[`items.${i}.designation`]}</div>
                                    )}
                                </div>
                                <div className="col-6 col-md-2">
                                    <label className="form-label">Quantité :</label>
                                    <input
                                        type="number" min={1}
                                        className="form-control"
                                        placeholder="Qté"
                                        value={item.quantite}
                                        onChange={e => handleItemChange(i, 'quantite', e.target.value)}
                                    />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label">Prix Unitaire : <span className="text-danger"  style={{color: colors.dangerRed}}>*</span></label>
                                    <input
                                        type="number" min={0} step="0.01"
                                        className="form-control"
                                        placeholder="Prix unitaire"
                                        value={item.prix_unitaire}
                                        onChange={e => handleItemChange(i, 'prix_unitaire', e.target.value)}
                                    />
                                </div>
                                    <div className="col-6 col-md-1 text-muted small">
                                        <label className="form-label">Valeur : </label><br></br>
                                        = {(Number(item.quantite) * Number(item.prix_unitaire)).toLocaleString()} F
                                    </div>
                                <div className="col-6 col-md-1">
                                    <button type="button" className="btn btn-sm btn-outline-danger w-100"
                                        onClick={() => removeItem(i)}
                                        disabled={formData.items.length === 1}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button type="button" className="btn btn-outline-info btn-sm mb-4" onClick={addItem}>
                        + Ajouter une ligne
                    </button>

                    {/* Totaux */}
                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <span>Total HT</span>
                                <strong>{formData.total_ht.toLocaleString()} F</strong>
                            </div>
                            <div className="d-flex justify-content-between text-muted">
                                <span>TVA ({formData.tva_taux}%)</span>
                                <span>{(formData.total_ttc - formData.total_ht).toLocaleString()} F</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fs-5">
                                <span className="fw-bold">Total TTC</span>
                                <strong className="text-success">{formData.total_ttc.toLocaleString()} F</strong>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-success mb-5 w-100" disabled={submitLoading}>
                        {submitLoading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer la facture')}
                    </button>
                </form>
            )}
        </div>

        
    );
};

export default Facture;