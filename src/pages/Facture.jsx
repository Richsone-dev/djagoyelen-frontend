import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import logo from '../assets/djago-logo.jpeg';
import { Colors } from 'chart.js';

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

            if (
                prev.total_ht === ht &&
                prev.total_ttc === ttc
            ) return prev;

            return {
                ...prev,
                total_ht: parseFloat(ht.toFixed(2)),
                total_ttc: parseFloat(ttc.toFixed(2))
            };

        });

    }, [formData.items, formData.tva_taux]);

    // ─────────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────────

    const fetchFactures = async () => {

        try {

            const res = await api.get('/factures');

            setFactures(
                Array.isArray(res.data)
                    ? res.data
                    : res.data.data || []
            );

        } catch (e) {

            console.error('Erreur fetchFactures:', e.response?.data || e.message);

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

            console.error('Erreur addClient:', e.response?.data || e.message);

            Swal.fire(
                'Erreur',
                e.response?.data?.message || e.message,
                'error'
            );

        }
    };

    // ─────────────────────────────────────────
    // SUBMIT FACTURE
    // ─────────────────────────────────────────

    const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSubmitLoading(true);

    try {
        
        
        Swal.fire({
            title: 'Patientez...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        // ✅ Validation client
        if (!formData.client_id) {
            setErrors({
                client_id: 'Veuillez sélectionner un client.'
            });
            setSubmitLoading(false);
            return;
        }
        Swal.close();
        
        // ✅ Validation items sécurisée (évite crash si undefined)
        const hasEmptyItem = formData.items.some(
            i => !i.designation || !i.designation.trim()
        );
        
        if (hasEmptyItem) {
            setErrors({
                items: 'Chaque ligne doit avoir une désignation.'
            });
            setSubmitLoading(false);
            return;
        }
        
        // ✅ Payload sécurisé (évite NaN)
        const payload = {
            client_id: Number(formData.client_id),
            date_emission: formData.date_emission,
            tva_taux: Number(formData.tva_taux ?? 0),
            total_ht: Number(formData.total_ht ?? 0),
            total_ttc: Number(formData.total_ttc ?? 0),
            
            items: formData.items.map(item => ({
                designation: (item.designation || '').trim(),
                quantite: Number(item.quantite ?? 0),
                prix_unitaire: Number(item.prix_unitaire ?? 0)
            }))
        };
        
        // ✅ MODE UPDATE
        if (isEditing && formData.id) {
            Swal.fire({
                title: 'Patientez...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
            
            await api.put(
                `/factures/${formData.id}`,
                payload
            );
            
            await Swal.fire(
                'Succès',
                'Facture modifiée avec succès',
                'success'
            );

        } else {
            
            // ✅ MODE CREATE
            await api.post('/factures', payload);
            
            await Swal.fire(
                'Succès',
                'Facture créée avec succès',
                'success'
            );
        }
        
        // ✅ RESET FORM PROPRE
        setShowModal(false);
        setFormData(initialFormState);
        setIsEditing(false);
        
        await fetchFactures();
        
    } catch (err) {
        
        console.error('Erreur submit:', err.response?.data || err.message);

        if (err.response?.status === 422) {
            
            const laravelErrors = err.response.data.errors || {};
            
            const flat = Object.fromEntries(
                Object.entries(laravelErrors).map(([key, msgs]) => [
                    key,
                    Array.isArray(msgs) ? msgs[0] : msgs
                ])
            );

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
    Swal.close();
};

    // ─────────────────────────────────────────
    // SUPPRIMER
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // ITEMS
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // FORMAT PRIX
    // ─────────────────────────────────────────

    const formatPrix = (value, separator = ' ') => {

        if (isNaN(value)) return '0';

        return Number(value)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    };

    // ─────────────────────────────────────────
    // PDF
    // ─────────────────────────────────────────

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
        doc.setLineWidth(0.3);

        doc.line(
            14,
            headerY + 5,
            196,
            headerY + 5
        );

        doc.setTextColor(0, 0, 0);

        doc.setFontSize(10);

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
        ).toLocaleDateString('fr-FR', {

            day: 'numeric',
            month: 'long',
            year: 'numeric'

        });

        doc.text(`Date : ${date}`, 14, 55);

        doc.setFont('helvetica', 'bold');

        doc.text('STATUT: Payé', 14, 60);

        doc.text('CLIENT', 130, 45);

        const nomClient = (
            fullFacture.client_nom ||
            fullFacture.client?.nom ||
            '---'
        ).toUpperCase();

        doc.text(nomClient, 130, 50);

        doc.setFont('helvetica', 'normal');

        doc.text(
            `Tél : ${fullFacture.client?.telephone || '---'}`,
            130,
            55
        );

        doc.text(
            `Email : ${fullFacture.client?.email || '---'}`,
            130,
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

                `${formatPrix(pu)} F CFA`,

                `${formatPrix(qte * pu)} F CFA`

            ];
        });

        autoTable(doc, {

            startY: 65,

            head: [[
                'Désignation',
                'Quantité',
                'Prix Unitaire',
                'Montant'
            ]],

            body: rows,

            foot: [

                ['','','Total HT',`${formatPrix(fullFacture.total_ht)} F CFA`
                ],

                ['','',`TVA (${fullFacture.tva_taux || 18}%)`,`${formatPrix(fullFacture.total_ttc -fullFacture.total_ht)} F CFA`
                ],

                [
                    '',
                    '',
                    'TOTAL TTC',
                    `${formatPrix(fullFacture.total_ttc)} F CFA`
                ]
            ],

            theme: 'grid',

            styles: {
                lineColor: [230, 230, 230],
                lineWidth: 0.1,
                fontSize: 10
            },

            headStyles: {
                fillColor: successGreen,
                textColor: 255,
                fontStyle: 'bold',
                textAlign: 'center',
                halign: 'center'
            },

            footStyles: {
                lineWidth: 0,
                fillColor: orange,
                textColor: 255,
                fontStyle: 'bold',
                textAlign: 'center'
            }
        });

        const finalY = doc.lastAutoTable.finalY || 100;

        doc.setFontSize(8);

        doc.setTextColor(120);

        doc.setFont('times', 'italic');

        doc.text(
            'Facture générée par DjagoYelen',
            14,
            finalY + 10
        );

        doc.setFontSize(10);

        doc.setTextColor(0);

        doc.setFont('helvetica', 'italic');

        doc.text(
            `Générée le ${date}`,
            150,
            finalY + 15
        );

        const utilisateur = JSON.parse(
            localStorage.getItem('user')
        );

        const userName =
            utilisateur?.name || '---';

        const téléphone =
            utilisateur?.telephone || '---';

        doc.setFont('helvetica', 'bold');

        doc.text(
            'Responsable commercial :',
            130,
            finalY + 20
        );

        doc.setFont('helvetica', 'normal');

        doc.text(userName, 130, finalY + 25);

        doc.text(téléphone, 130, finalY + 30);

        const qrData = `
            DjagoYelen FACTURATION
Facture: ${numFacture}
Client: ${fullFacture.client?.nom}
Tél: ${fullFacture.client?.telephone || '---'}
Email: ${fullFacture.client?.email || '---'}
Total TTC: ${formatPrix(fullFacture.total_ttc)} F CFA
Date: ${date}
Responsable: ${userName}
Tél: ${téléphone}`;

        const qrImage = await QRCode.toDataURL(qrData);

        doc.addImage(
            qrImage,'PNG',100,37,25,25);

        return {
            doc,
            fullFacture,
            blob: doc.output('blob')
        };

    }, []);

    // ─────────────────────────────────────────
    // PREVIEW PDF
    // ─────────────────────────────────────────

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

    // ─────────────────────────────────────────
    // TELECHARGER
    // ─────────────────────────────────────────

    const handleDownloadPDF = async (facture) => {

        try {
            Swal.fire({
                title: 'Téléchargement...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const { doc, fullFacture } =
                await buildPdf(facture);

            doc.save(
                `Facture_${
                    fullFacture.numero_facture ||
                    fullFacture.id
                }.pdf`
            );
            Swal.close();


        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de télécharger le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────────────────
    // PARTAGE
    // ─────────────────────────────────────────

    const handleSharePDF = async (facture) => {

        try {
            Swal.fire({
                title: 'Partage...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

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

                window.open(url, '_blank');

            }

            Swal.close();

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de partager le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────────

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: '80vh',
                    backgroundColor: colors.lightGray
                }}
            >

                <div
                    className="spinner-border"
                    style={{ color: colors.orange }}
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
            placeholder: 'Ex: SANOU Norbert',
            type: 'text'
        },

        email: {
            placeholder: 'Ex: norbert123@exemple.com',
            type: 'email'
        },

        telephone: {
            placeholder: 'Ex: 70 00 00 00',
            type: 'tel'
        },

        adresse: {
            placeholder: 'Ex: Rue 23, Bobo-Dioulasso',
            type: 'text'
        }
    };

    return (

        <div className="container p-1 mb-5">

            {/* ───────────────────────────── */}
            {/* PREVIEW PDF */}
            {/* ───────────────────────────── */}

            {showPreview && (

                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-light pb-5"
                    style={{
                        zIndex: 9999,
                        overflow: 'hidden'
                    }}
                >

                    {/* HEADER */}
                    <div
                        className=" bg-success border-bottom d-flex justify-content-between align-items-center p-3" style={{backgroundColor: Colors.successGreen, color: 'white'}}
                    >

                        <h5 className="mb-0">
                            Prévisualisation de la facture #{previewFacture.numero_facture || previewFacture.id}
                        </h5>

                        <button
                            className="btn-close" style={{color: 'white'}}
                            onClick={() => {

                                setShowPreview(false);

                                if (previewUrl) {
                                    URL.revokeObjectURL(previewUrl);
                                }

                                setPreviewUrl(null);

                            }}
                        />

                    </div>
                            {/* FOOTER */}
                            <div
                                className="bg-white border-top p-2 d-flex gap-2 justify-content-center flex-wrap"
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
                                        <i className="bi bi-chevron-left"></i>
        
                                     Retour
        
                                </button>
        
                                <button
                                    className="btn btn-success"
                                    onClick={() =>
                                        handleDownloadPDF(previewFacture)
                                    }
                                >
                                    <i className="bi bi-download-fill"></i>
        
                                    Télécharger
        
                                </button>
        
                                <button
                                    className="btn btn-success"
                                    onClick={() =>
                                        handleSharePDF(previewFacture)
                                    }
                                >
                                    <i className="bi bi-share-fill"></i>
                                    Partager
        
                                </button>
        
                            </div>

                    {/* PDF */}
                    <div
                        style={{
                            height: 'calc(100vh - 130px)',
                            background: '#1e1e1e'
                        }}
                    >

                        <iframe
                            title="PDF Preview"
                            src={previewUrl}
                            width="100%"
                            height="100%"
                            style={{
                                border: 'none'
                            }}
                        />

                    </div>

                </div>

            )}

            {/* ───────────────────────────── */}
            {/* MODAL CLIENT */}
            {/* ───────────────────────────── */}

            {showClientModal && (

                <div
                    className="modal show d-block"
                    style={{
                        background: 'rgba(0,0,0,0.5)'
                    }}
                >

                    <div className="modal-dialog">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5 className="modal-title">
                                    Nouveau Client
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() =>
                                        setShowClientModal(false)
                                    }
                                />

                            </div>

                            <form onSubmit={handleAddClient}>

                                <div className="modal-body">

                                    {Object.keys(fieldConfig).map(field => (

                                        <div
                                            className="mb-2"
                                            key={field}
                                        >

                                            <label className="form-label text-capitalize">
                                                {field}
                                            </label>

                                            <input
                                                type={fieldConfig[field].type}
                                                className="form-control"
                                                value={newClient[field] || ''}
                                                onChange={e =>
                                                    setNewClient(p => ({
                                                        ...p,
                                                        [field]: e.target.value
                                                    }))
                                                }
                                                required={field === 'nom'}
                                                placeholder={
                                                    fieldConfig[field].placeholder
                                                }
                                            />

                                        </div>
                                    ))}

                                </div>

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setShowClientModal(false)
                                        }
                                    >

                                        Annuler

                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                    >

                                        Enregistrer
                                    </button>
                                </div>

                            </form>

                        </div>

                    </div>

                </div>
            )}

            {/* ───────────────────────────── */}
            {/* LISTE */}
            {/* ───────────────────────────── */}

            {!showModal ? (

                <>

                    <div className="d-flex justify-content-between align-items-center mb-3">

                        <h3 className="mb-0" style={{color:Colors.successGreen}}>
                            <i className="bi bi-receipt w-100 m-2"></i>
                            Factures
                        </h3>

                        <button
                            className="btn btn-success"
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

                    {factures.length === 0 ? (

                        <p className="text-muted">
                            Aucune facture enregistrée.
                        </p>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle shadow-sm">

                                <thead className="bg-success text-white">

                                    <tr>

                                        <th>N°</th>

                                        <th>Client</th>

                                        <th className="d-none d-md-table-cell">
                                            Date
                                        </th>

                                        <th>Total TTC</th>

                                        <th className="text-end">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className='table-light' style={{backgroundColor: colors.red100}}>

                                    {factures.map(f => (

                                        <tr key={f.id}>

                                            <td className="fw-bold text-primary">
                                                #
                                                {
                                                    f.numero_facture ||
                                                    f.id
                                                }
                                            </td>

                                            <td>

                                                <div className="fw-semibold">
                                                    {f.client?.nom || '-'}
                                                </div>

                                                <small className="text-muted d-md-none">
                                                    {f.date_emission || '-'}
                                                </small>

                                            </td>

                                            <td className="d-none d-md-table-cell">
                                                {f.date_emission || '-'}
                                            </td>

                                            <td className="fw-bold text-success">
                                                {formatPrix(f.total_ttc)} F
                                            </td>

                                            <td className="text-end">

                                                <div className="btn-group flex-wrap">

                                                    {/* PREVIEW */}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Prévisualiser"
                                                        onClick={() =>
                                                            handlePreviewPDF(f)
                                                        }
                                                    >

                                                        <i className="bi bi-eye"></i>

                                                    </button>

                                                    {/* DOWNLOAD */}
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        title="Télécharger"
                                                        onClick={() =>
                                                            handleDownloadPDF(f)
                                                        }
                                                    >

                                                        <i className="bi bi-file-earmark-pdf"></i>

                                                    </button>

                                                    {/* SHARE */}
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        title="Partager"
                                                        onClick={() =>
                                                            handleSharePDF(f)
                                                        }
                                                    >

                                                        <i className="bi bi-share"></i>

                                                    </button>

                                                    {/* EDIT */}
                                                    <button
    className="btn btn-sm btn-outline-warning"
    title="Modifier"
    onClick={async () => {

        try {

            Swal.fire({
                title: 'Patientez...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            setErrors({});

            setIsEditing(true);

            // ✅ Charger la facture complète depuis Laravel
            const res = await api.get(`/factures/${f.id}`);

            const factureComplete = res.data.data || res.data;

            // ✅ Gestion sécurisée des lignes
            let items = [];

            // Cas 1 : lignes relation Laravel
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

            // Cas 2 : items JSON string
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

            // Cas 3 : items tableau
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

            // ✅ Sécurité si aucune ligne
            if (items.length === 0) {

                items = [
                    {
                        designation: '',
                        quantite: 1,
                        prix_unitaire: 0
                    }
                ];
            }

            // ✅ Pré-remplissage COMPLET du formulaire
            setFormData({

                id: factureComplete.id,

                client_id:
                    factureComplete.client_id || '',

                date_emission:
                    factureComplete.date_emission
                        ?.split('T')[0] ||
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

            // ✅ Ouvrir le formulaire
            setShowModal(true);

        } catch (error) {

            console.error(error);

            Swal.fire(
                'Erreur',
                'Impossible de charger la facture',
                'error'
            );
        }
        Swal.close();
    }}
>
    <i className="bi bi-pencil-square"></i>
</button>

                                                    {/* DELETE */}
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Supprimer"
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
                    )}

                </>

            ) : (

                // ─────────────────────────────
                // FORMULAIRE
                // ─────────────────────────────

                <form
                    onSubmit={handleSubmit}
                    className="mb-5"
                    style={{ textAlign: 'left' }}
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
                            <i className="bi bi-chevron-left"></i>

                             Retour

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

                            <span
                                className="text-danger"
                                style={{
                                    color: colors.dangerRed
                                }}
                            >
                                *
                            </span>

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
                                className="btn btn-outline-primary text-nowrap"
                                onClick={() =>
                                    setShowClientModal(true)
                                }
                            >

                                + Nouveau

                            </button>

                        </div>

                        {errors.client_id && (

                            <div className="text-danger small mt-1">
                                {errors.client_id}
                            </div>

                        )}

                    </div>

                    {/* DATE */}
                    <div className="mb-3">

                        <label className="form-label">
                            Date d'émission
                        </label>

                        <input
                            type="date"
                            className="form-control"
                            value={formData.date_emission}
                            disabled
                        />

                    </div>

                    {/* TVA */}
                    <div className="mb-3">

                        <label className="form-label">
                            Taux TVA (%)
                        </label>

                        <input
                            type="number"
                            className="form-control"
                            style={{ maxWidth: 120 }}
                            value={formData.tva_taux}
                            disabled
                        />

                    </div>

                    {/* ITEMS */}
                    <label className="form-label fw-bold">
                        Lignes de facturation
                    </label>

                    {errors.items && (

                        <div className="text-danger small mb-2">
                            {errors.items}
                        </div>

                    )}

                    {formData.items.map((item, i) => (

                        <div
                            key={i}
                            className="border rounded p-3 mb-2 bg-light"
                        >

                            <div className="row g-2 align-items-center">

                                <div className="col-12 col-md-5">

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

                                <div className="col-6 col-md-2">

                                    <label className="form-label">
                                        Quantité
                                    </label>

                                    <input
                                        type="number"
                                        min={1}
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

                                <div className="col-6 col-md-3">

                                    <label className="form-label">
                                        Prix Unitaire
                                    </label>

                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
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

                                <div className="col-6 col-md-1 text-muted small">

                                    <label className="form-label">
                                        Valeur
                                    </label>

                                    <br />

                                    ={' '}
                                    {(
                                        Number(item.quantite) *
                                        Number(item.prix_unitaire)
                                    ).toLocaleString()}{' '}
                                    F

                                </div>

                                <div className="col-6 col-md-1">

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger w-100"
                                        onClick={() =>
                                            removeItem(i)
                                        }
                                        disabled={
                                            formData.items.length === 1
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

                    {/* TOTALS */}
                    <div className="card mb-3">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <span>Total HT</span>

                                <strong>
                                    {formData.total_ht.toLocaleString()} F
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between text-muted">

                                <span>
                                    TVA ({formData.tva_taux}%)
                                </span>

                                <span>
                                    {(
                                        formData.total_ttc -
                                        formData.total_ht
                                    ).toLocaleString()}{' '}
                                    F
                                </span>

                            </div>

                            <hr />

                            <div className="d-flex justify-content-between fs-5">

                                <span className="fw-bold">
                                    Total TTC
                                </span>

                                <strong className="text-success">
                                    {formData.total_ttc.toLocaleString()} F
                                </strong>

                            </div>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-success mb-5 w-100"
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