import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import logo from '../assets/djago-logo.jpeg';

const Facture = () => {

    const [factures, setFactures] = useState([]);
    const [user, setUser] = useState(null);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);

    // ✅ PREVIEW PDF
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewFacture, setPreviewFacture] = useState(null);

    const [newClient, setNewClient] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
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

        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

    }, []);

    // ✅ Calcul automatique
    useEffect(() => {

        const ht = formData.items.reduce((sum, item) => {

            const qte = Number(item.quantite) || 0;
            const pu = Number(item.prix_unitaire) || 0;

            return sum + qte * pu;

        }, 0);

        const tva = ht * (Number(formData.tva_taux) / 100);
        const ttc = ht + tva;

        setFormData(prev => ({

            ...prev,

            total_ht: parseFloat(ht.toFixed(2)),
            total_ttc: parseFloat(ttc.toFixed(2))

        }));

    }, [formData.items, formData.tva_taux]);

    // ─────────────────────────────
    // FETCH
    // ─────────────────────────────

    const fetchFactures = async () => {

        try {

            const res = await api.get('/factures');

            setFactures(
                Array.isArray(res.data)
                    ? res.data
                    : res.data.data || []
            );

        } catch (e) {

            console.error(e);

        } finally {

            setLoading(false);

        }
    };

    const fetchClients = async () => {

        try {

            const res = await api.get('/clients');

            setClients(
                Array.isArray(res.data)
                    ? res.data
                    : res.data.data || []
            );

        } catch (e) {

            console.error(e);

        }
    };

    // ─────────────────────────────
    // CLIENT
    // ─────────────────────────────

    const handleAddClient = async (e) => {

        e.preventDefault();

        try {

            const res = await api.post('/clients', newClient);

            const created = res.data.data || res.data;

            setClients(prev => [...prev, created]);

            setFormData(prev => ({
                ...prev,
                client_id: created.id
            }));

            setShowClientModal(false);

            setNewClient({
                nom: '',
                email: '',
                telephone: '',
                adresse: ''
            });

            Swal.fire(
                'Succès',
                'Client ajouté avec succès',
                'success'
            );

        } catch (e) {

            console.error(e);

            Swal.fire(
                'Erreur',
                e.response?.data?.message || e.message,
                'error'
            );
        }
    };

    // ─────────────────────────────
    // SUBMIT
    // ─────────────────────────────

    const handleSubmit = async (e) => {

        e.preventDefault();

        setErrors({});
        setSubmitLoading(true);

        if (!formData.client_id) {

            setErrors({
                client_id: 'Veuillez sélectionner un client.'
            });

            setSubmitLoading(false);

            return;
        }

        const hasEmptyItem = formData.items.some(
            i => !i.designation.trim()
        );

        if (hasEmptyItem) {

            setErrors({
                items: 'Chaque ligne doit avoir une désignation.'
            });

            setSubmitLoading(false);

            return;
        }

        const payload = {

            client_id: parseInt(formData.client_id),

            date_emission: formData.date_emission,

            tva_taux: parseFloat(formData.tva_taux),

            total_ht: parseFloat(formData.total_ht),

            total_ttc: parseFloat(formData.total_ttc),

            items: formData.items.map(item => ({

                designation: String(item.designation || '').trim(),

                quantite: parseInt(item.quantite || 0),

                prix_unitaire: parseFloat(item.prix_unitaire || 0)

            }))
        };

        try {

            if (isEditing && formData.id) {

                await api.put(
                    `/factures/${formData.id}`,
                    payload
                );

                Swal.fire(
                    'Succès',
                    'Facture modifiée avec succès',
                    'success'
                );

            } else {

                await api.post('/factures', payload);

                Swal.fire(
                    'Succès',
                    'Facture créée avec succès',
                    'success'
                );
            }

            setShowModal(false);

            setFormData(initialFormState);

            setIsEditing(false);

            await fetchFactures();

        } catch (err) {

            console.error(err);

            if (err.response?.status === 422) {

                const laravelErrors = err.response.data.errors || {};

                const flat = {};

                Object.entries(laravelErrors).forEach(([key, msgs]) => {

                    flat[key] = Array.isArray(msgs)
                        ? msgs[0]
                        : msgs;

                });

                setErrors(flat);

            } else {

                Swal.fire(
                    'Erreur',
                    err.response?.data?.message || err.message,
                    'error'
                );
            }

        } finally {

            setSubmitLoading(false);

        }
    };

    // ─────────────────────────────
    // DELETE
    // ─────────────────────────────

    const handleDelete = async (id) => {

        const result = await Swal.fire({

            title: 'Êtes-vous sûr ?',

            text: 'Cette action est irréversible !',

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor: '#d33',

            cancelButtonColor: '#6c757d',

            cancelButtonText: 'Annuler',

            confirmButtonText: 'Oui, supprimer'

        });

        if (result.isConfirmed) {

            try {

                await api.delete(`/factures/${id}`);

                setFactures(prev =>
                    prev.filter(f => f.id !== id)
                );

                Swal.fire(
                    'Supprimé !',
                    'La facture a été supprimée.',
                    'success'
                );

            } catch (err) {

                console.error(err);

                Swal.fire(
                    'Erreur',
                    err.response?.data?.message || 'Erreur',
                    'error'
                );
            }
        }
    };

    // ─────────────────────────────
    // ITEMS
    // ─────────────────────────────

    const handleItemChange = (index, field, value) => {

        const items = [...formData.items];

        items[index] = {
            ...items[index],
            [field]:
                field === 'designation'
                    ? value
                    : Number(value)
        };

        setFormData(prev => ({
            ...prev,
            items
        }));
    };

    const addItem = () => {

        setFormData(prev => ({

            ...prev,

            items: [
                ...prev.items,
                {
                    designation: '',
                    quantite: 1,
                    prix_unitaire: 0
                }
            ]
        }));
    };

    const removeItem = (index) => {

        if (formData.items.length === 1) return;

        setFormData(prev => ({

            ...prev,

            items: prev.items.filter((_, i) => i !== index)

        }));
    };

    // ─────────────────────────────
    // FORMAT
    // ─────────────────────────────

    const formatPrix = (value, separator = ' ') => {

        if (isNaN(value)) return '0';

        return Number(value)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    };

    // ─────────────────────────────
    // PDF
    // ─────────────────────────────

    const buildPdf = useCallback(async (facture) => {

        const res = await api.get(`/factures/${facture.id}`);

        const fullFacture = res.data.data || res.data;

        const doc = new jsPDF();

        const numFacture =
            fullFacture.numero_facture ||
            fullFacture.id;

        const successGreen = [25, 135, 84];
        const orange = [233, 114, 35];

        const headerY = 30;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');

        doc.setTextColor(...successGreen);
        doc.text('Djago', 14, headerY - 4);

        const widthDjago = doc.getTextWidth('Djago');

        doc.setTextColor(...orange);

        doc.text(
            'Yelen',
            14 + widthDjago,
            headerY - 4
        );

        doc.setFont('helvetica', 'normal');

        doc.setTextColor(0, 0, 0);

        doc.setFontSize(10);

        doc.text(
            'Services Numériques & Gestion financière',
            14,
            headerY + 2
        );

        try {

            doc.addImage(
                logo,
                'JPEG',
                165,
                headerY - 22,
                30,
                30
            );

        } catch {

            console.warn('Logo non chargé');

        }

        doc.setDrawColor(...orange);

        doc.line(
            14,
            headerY + 5,
            196,
            headerY + 5
        );

        doc.setFont('helvetica', 'bold');

        doc.text('DETAILS DE LA FACTURE', 14, 45);

        doc.setFont('helvetica', 'normal');

        doc.text(
            `Référence : ${numFacture}`,
            14,
            50
        );

        const date = new Date(
            fullFacture.date_emission
        ).toLocaleDateString('fr-FR');

        doc.text(`Date : ${date}`, 14, 55);

        doc.text(
            `Client : ${fullFacture.client?.nom || '-'}`,
            14,
            60
        );

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

        const rows = items.map(i => {

            const qte = Number(i.quantite || 0);

            const pu = Number(
                i.prix_unitaire ||
                i.prix ||
                0
            );

            return [

                i.designation ||
                i.description ||
                'N/A',

                qte,

                `${formatPrix(pu)} F`,

                `${formatPrix(qte * pu)} F`

            ];
        });

        autoTable(doc, {

            startY: 70,

            head: [[
                'Désignation',
                'Quantité',
                'Prix Unitaire',
                'Montant'
            ]],

            body: rows,

            foot: [

                [
                    '',
                    '',
                    'Total HT',
                    `${formatPrix(fullFacture.total_ht)} F`
                ],

                [
                    '',
                    '',
                    `TVA (${fullFacture.tva_taux || 18}%)`,
                    `${formatPrix(
                        fullFacture.total_ttc -
                        fullFacture.total_ht
                    )} F`
                ],

                [
                    '',
                    '',
                    'TOTAL TTC',
                    `${formatPrix(fullFacture.total_ttc)} F`
                ]
            ],

            theme: 'grid',

            styles: {
                fontSize: 9
            },

            headStyles: {
                fillColor: successGreen
            },

            footStyles: {
                fillColor: orange
            }
        });

        const qrImage = await QRCode.toDataURL(
            `Facture ${numFacture}`
        );

        doc.addImage(
            qrImage,
            'PNG',
            160,
            35,
            25,
            25
        );

        return {
            doc,
            fullFacture,
            blob: doc.output('blob')
        };

    }, []);

    // ─────────────────────────────
    // PREVIEW PDF
    // ─────────────────────────────

    const handlePreviewPDF = async (facture) => {

        try {

            Swal.fire({
                title: 'Chargement...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const { blob } = await buildPdf(facture);

            const url = URL.createObjectURL(blob);

            setPreviewUrl(url);

            setPreviewFacture(facture);

            setShowPreview(true);

            Swal.close();

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de générer le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────
    // DOWNLOAD
    // ─────────────────────────────

    const handleDownloadPDF = async (facture) => {

        try {

            const { doc, fullFacture } =
                await buildPdf(facture);

            doc.save(
                `Facture_${
                    fullFacture.numero_facture ||
                    fullFacture.id
                }.pdf`
            );

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de télécharger le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────
    // SHARE
    // ─────────────────────────────

    const handleSharePDF = async (facture) => {

        try {

            const { blob, fullFacture } =
                await buildPdf(facture);

            const file = new File(
                [blob],
                `Facture_${fullFacture.numero_facture || fullFacture.id}.pdf`,
                {
                    type: 'application/pdf'
                }
            );

            if (
                navigator.canShare &&
                navigator.canShare({ files: [file] })
            ) {

                await navigator.share({

                    title: 'Facture PDF',

                    text: 'Partage de facture',

                    files: [file]

                });

            } else {

                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');

                link.href = url;

                link.download = file.name;

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

            }

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de partager le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────
    // EDIT
    // ─────────────────────────────

    const handleEditFacture = async (facture) => {

        try {

            setErrors({});

            setIsEditing(true);

            const res = await api.get(`/factures/${facture.id}`);

            const factureComplete = res.data.data || res.data;

            let items = [];

            // ✅ lignes relation Laravel
            if (
                factureComplete.lignes &&
                Array.isArray(factureComplete.lignes)
            ) {

                items = factureComplete.lignes.map(item => ({
                    designation:
                        item.designation ||
                        item.description ||
                        '',

                    quantite:
                        Number(item.quantite) || 1,

                    prix_unitaire:
                        Number(
                            item.prix_unitaire ||
                            item.prix ||
                            0
                        )
                }));
            }

            // ✅ items JSON
            else if (
                typeof factureComplete.items === 'string'
            ) {

                try {

                    const parsed = JSON.parse(
                        factureComplete.items
                    );

                    items = parsed.map(item => ({
                        designation:
                            item.designation ||
                            item.description ||
                            '',

                        quantite:
                            Number(item.quantite) || 1,

                        prix_unitaire:
                            Number(
                                item.prix_unitaire ||
                                item.prix ||
                                0
                            )
                    }));

                } catch {

                    items = [];
                }
            }

            // ✅ items tableau
            else if (
                Array.isArray(factureComplete.items)
            ) {

                items = factureComplete.items.map(item => ({
                    designation:
                        item.designation ||
                        item.description ||
                        '',

                    quantite:
                        Number(item.quantite) || 1,

                    prix_unitaire:
                        Number(
                            item.prix_unitaire ||
                            item.prix ||
                            0
                        )
                }));
            }

            // ✅ sécurité
            if (items.length === 0) {

                items = [{
                    designation: '',
                    quantite: 1,
                    prix_unitaire: 0
                }];
            }

            // ✅ FORMULAIRE COMPLET
            setFormData({

                id: factureComplete.id,

                client_id:
                    factureComplete.client_id || '',

                date_emission:
                    factureComplete.date_emission
                        ?.split('T')[0]
                    ||
                    new Date()
                        .toISOString()
                        .split('T')[0],

                items,

                tva_taux:
                    Number(
                        factureComplete.tva_taux
                    ) || 18,

                total_ht:
                    Number(
                        factureComplete.total_ht
                    ) || 0,

                total_ttc:
                    Number(
                        factureComplete.total_ttc
                    ) || 0

            });

            setShowModal(true);

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de charger la facture',
                'error'
            );
        }
    };

    // ─────────────────────────────
    // LOADING
    // ─────────────────────────────

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: '80vh'
                }}
            >

                <div
                    className="spinner-border text-success"
                    role="status"
                >

                    <span className="visually-hidden">
                        Chargement...
                    </span>

                </div>

            </div>
        );
    }

    const fieldConfig = {

        nom: {
            placeholder: 'Ex: Jean Dupont',
            type: 'text'
        },

        email: {
            placeholder: 'Ex: jean@exemple.com',
            type: 'email'
        },

        telephone: {
            placeholder: 'Ex: 70 00 00 00',
            type: 'tel'
        },

        adresse: {
            placeholder: 'Ex: Bobo-Dioulasso',
            type: 'text'
        }
    };

    return (

        <div className="container p-3 mb-5">

            {/* PREVIEW PDF */}
            {showPreview && (

                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-white"
                    style={{
                        zIndex: 9999
                    }}
                >

                    {/* HEADER */}
                    <div
                        className="bg-success text-white d-flex justify-content-between align-items-center p-3"
                    >

                        <h5 className="mb-0">
                            Prévisualisation PDF
                        </h5>

                        <button
                            className="btn btn-light btn-sm"
                            onClick={() => {

                                setShowPreview(false);

                                if (previewUrl) {
                                    URL.revokeObjectURL(previewUrl);
                                }

                                setPreviewUrl(null);

                            }}
                        >

                            Fermer

                        </button>

                    </div>

                    {/* PDF */}
                    <div
                        style={{
                            height: 'calc(100vh - 120px)',
                            overflow: 'auto',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >

                        {/* ✅ Android + iPhone */}
                        <iframe
                            title="PDF Preview"
                            src={`${previewUrl}#toolbar=0`}
                            width="100%"
                            height="100%"
                            style={{
                                border: 'none',
                                minHeight: '100%'
                            }}
                        />

                    </div>

                    {/* FOOTER */}
                    <div
                        className="bg-light border-top p-2 d-flex gap-2 justify-content-center flex-wrap"
                    >

                        <button
                            className="btn btn-secondary"
                            onClick={() => {

                                setShowPreview(false);

                                if (previewUrl) {
                                    URL.revokeObjectURL(previewUrl);
                                }

                                setPreviewUrl(null);

                            }}
                        >

                            Retour

                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() =>
                                handleDownloadPDF(previewFacture)
                            }
                        >

                            Télécharger

                        </button>

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                handleSharePDF(previewFacture)
                            }
                        >

                            Partager

                        </button>

                    </div>

                </div>
            )}

            {/* LISTE */}
            {!showModal ? (

                <>

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h3 className="mb-0">
                            Factures
                        </h3>

                        <button
                            className="btn btn-primary"
                            onClick={() => {

                                setFormData(initialFormState);

                                setIsEditing(false);

                                setErrors({});

                                setShowModal(true);

                            }}
                        >

                            + Nouvelle facture

                        </button>

                    </div>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-success">

                                <tr>

                                    <th>N°</th>
                                    <th>Client</th>
                                    <th>Total TTC</th>
                                    <th className="text-end">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {factures.map(f => (

                                    <tr key={f.id}>

                                        <td>
                                            #
                                            {f.numero_facture || f.id}
                                        </td>

                                        <td>
                                            {f.client?.nom || '-'}
                                        </td>

                                        <td className="fw-bold text-success">
                                            {formatPrix(f.total_ttc)} F
                                        </td>

                                        <td className="text-end">

                                            <div className="btn-group flex-wrap">

                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() =>
                                                        handlePreviewPDF(f)
                                                    }
                                                >

                                                    <i className="bi bi-eye"></i>

                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() =>
                                                        handleDownloadPDF(f)
                                                    }
                                                >

                                                    <i className="bi bi-file-earmark-pdf"></i>

                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() =>
                                                        handleSharePDF(f)
                                                    }
                                                >

                                                    <i className="bi bi-share"></i>

                                                </button>

                                                {/* ✅ EDIT FIX */}
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() =>
                                                        handleEditFacture(f)
                                                    }
                                                >

                                                    <i className="bi bi-pencil-square"></i>

                                                </button>

                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() =>
                                                        handleDelete(f.id)
                                                    }
                                                >

                                                    <i className="bi bi-trash"></i>

                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>

                </>

            ) : (

                <form
                    onSubmit={handleSubmit}
                    className="mb-5"
                >

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {

                                setShowModal(false);

                                setErrors({});

                            }}
                        >

                            ← Retour

                        </button>

                        <h4>

                            {isEditing
                                ? 'Modifier la facture'
                                : 'Nouvelle facture'}

                        </h4>

                    </div>

                    {/* CLIENT */}
                    <div className="mb-3">

                        <label className="form-label">
                            Client
                        </label>

                        <div className="d-flex gap-2">

                            <select
                                className={`form-control ${
                                    errors.client_id
                                        ? 'is-invalid'
                                        : ''
                                }`}
                                value={formData.client_id}
                                onChange={e =>
                                    setFormData(p => ({
                                        ...p,
                                        client_id: Number(e.target.value)
                                    }))
                                }
                            >

                                <option value="">
                                    -- Choisir un client --
                                </option>

                                {clients.map(c => (

                                    <option
                                        key={c.id}
                                        value={c.id}
                                    >

                                        {c.nom}

                                    </option>

                                ))}

                            </select>

                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    setShowClientModal(true)
                                }
                            >

                                + Nouveau

                            </button>

                        </div>

                    </div>

                    {/* ITEMS */}
                    <label className="form-label fw-bold">
                        Lignes de facturation
                    </label>

                    {formData.items.map((item, i) => (

                        <div
                            key={i}
                            className="border rounded p-3 mb-2 bg-light"
                        >

                            <div className="row g-2">

                                <div className="col-md-5">

                                    <label className="form-label">
                                        Désignation
                                    </label>

                                    <input
                                        className="form-control"
                                        value={item.designation}
                                        onChange={e =>
                                            handleItemChange(
                                                i,
                                                'designation',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="col-md-2">

                                    <label className="form-label">
                                        Quantité
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={item.quantite}
                                        onChange={e =>
                                            handleItemChange(
                                                i,
                                                'quantite',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="col-md-3">

                                    <label className="form-label">
                                        Prix Unitaire
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={item.prix_unitaire}
                                        onChange={e =>
                                            handleItemChange(
                                                i,
                                                'prix_unitaire',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="col-md-2 d-flex align-items-end">

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger w-100"
                                        onClick={() =>
                                            removeItem(i)
                                        }
                                    >

                                        ✕

                                    </button>

                                </div>

                            </div>

                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm mb-4"
                        onClick={addItem}
                    >

                        + Ajouter une ligne

                    </button>

                    {/* TOTAL */}
                    <div className="card mb-3">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <span>Total HT</span>

                                <strong>
                                    {formData.total_ht.toLocaleString()} F
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between">

                                <span>
                                    TVA ({formData.tva_taux}%)
                                </span>

                                <span>
                                    {(
                                        formData.total_ttc -
                                        formData.total_ht
                                    ).toLocaleString()} F
                                </span>

                            </div>

                            <hr />

                            <div className="d-flex justify-content-between fs-5">

                                <strong>Total TTC</strong>

                                <strong className="text-success">
                                    {formData.total_ttc.toLocaleString()} F
                                </strong>

                            </div>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-success w-100"
                        disabled={submitLoading}
                    >

                        {submitLoading
                            ? 'Enregistrement...'
                            : isEditing
                            ? 'Mettre à jour'
                            : 'Enregistrer la facture'}

                    </button>

                </form>
            )}

        </div>
    );
};

export default Facture;