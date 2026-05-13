import React, { useEffect, useState } from 'react';
import api from '../api/axios';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

import Swal from 'sweetalert2';

import logo from '../assets/djago-logo.jpeg';

const Facture = () => {

    // =========================
    // STATES
    // =========================

    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [showClientModal, setShowClientModal] = useState(false);

    const [showPreview, setShowPreview] = useState(false);

    const [previewUrl, setPreviewUrl] = useState('');

    const [currentPdfName, setCurrentPdfName] = useState('');

    const [submitLoading, setSubmitLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({});

    // =========================
    // CLIENT
    // =========================

    const [newClient, setNewClient] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
    });

    // =========================
    // FORMULAIRE FACTURE
    // =========================

    const initialFormState = {
        id: null,
        client_id: '',
        date_emission: new Date().toISOString().split('T')[0],
        tva_taux: 18,
        total_ht: 0,
        total_ttc: 0,
        items: [
            {
                designation: '',
                quantite: 1,
                prix_unitaire: 0
            }
        ]
    };

    const [formData, setFormData] = useState(initialFormState);

    // =========================
    // COLORS
    // =========================

    const colors = {
        green: '#198754',
        orange: '#E97223',
        danger: '#dc3545'
    };

    // =========================
    // FETCH
    // =========================

    useEffect(() => {

        fetchFactures();

        fetchClients();

    }, []);

    const fetchFactures = async () => {

        try {

            const res = await api.get('/factures');

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];

            setFactures(
                [...data].sort((a, b) => b.id - a.id)
            );

        } catch (err) {

            console.error(err);

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

        } catch (err) {

            console.error(err);
        }
    };

    // =========================
    // CALCULS
    // =========================

    useEffect(() => {

        const ht = formData.items.reduce((sum, item) => {

            const qte = Number(item.quantite || 0);

            const pu = Number(item.prix_unitaire || 0);

            return sum + (qte * pu);

        }, 0);

        const tva =
            ht * (Number(formData.tva_taux) / 100);

        const ttc = ht + tva;

        setFormData(prev => ({
            ...prev,
            total_ht: Number(ht.toFixed(2)),
            total_ttc: Number(ttc.toFixed(2))
        }));

    }, [formData.items, formData.tva_taux]);

    // =========================
    // FORMAT PRIX
    // =========================

    const formatPrix = (value) => {

        return Number(value || 0)
            .toLocaleString('fr-FR');
    };

    // =========================
    // AJOUT CLIENT
    // =========================

    const handleAddClient = async (e) => {

        e.preventDefault();

        try {

            const res = await api.post(
                '/clients',
                newClient
            );

            const client = res.data.data || res.data;

            setClients(prev => [...prev, client]);

            setFormData(prev => ({
                ...prev,
                client_id: client.id
            }));

            setNewClient({
                nom: '',
                email: '',
                telephone: '',
                adresse: ''
            });

            setShowClientModal(false);

            Swal.fire(
                'Succès',
                'Client ajouté',
                'success'
            );

        } catch (err) {

            console.error(err);

            Swal.fire(
                'Erreur',
                'Impossible d’ajouter le client',
                'error'
            );
        }
    };

    // =========================
    // ITEMS
    // =========================

    const handleItemChange = (
        index,
        field,
        value
    ) => {

        const items = [...formData.items];

        items[index][field] =
            field === 'designation'
                ? value
                : Number(value);

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
            items: prev.items.filter(
                (_, i) => i !== index
            )
        }));
    };

    // =========================
    // ENREGISTREMENT FACTURE
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSubmitLoading(true);

        setErrors({});

        try {

            const payload = {

                client_id: Number(formData.client_id),

                date_emission:
                    formData.date_emission,

                tva_taux:
                    Number(formData.tva_taux),

                total_ht:
                    Number(formData.total_ht),

                total_ttc:
                    Number(formData.total_ttc),

                items: formData.items.map(item => ({
                    designation:
                        item.designation,

                    quantite:
                        Number(item.quantite),

                    prix_unitaire:
                        Number(item.prix_unitaire)
                }))
            };

            if (isEditing) {

                await api.put(
                    `/factures/${formData.id}`,
                    payload
                );

                Swal.fire(
                    'Succès',
                    'Facture modifiée',
                    'success'
                );

            } else {

                await api.post(
                    '/factures',
                    payload
                );

                Swal.fire(
                    'Succès',
                    'Facture créée',
                    'success'
                );
            }

            setShowModal(false);

            setFormData(initialFormState);

            setIsEditing(false);

            fetchFactures();

        } catch (err) {

            console.error(err);

            if (
                err.response?.status === 422
            ) {

                setErrors(
                    err.response.data.errors || {}
                );

            } else {

                Swal.fire(
                    'Erreur',
                    'Erreur serveur',
                    'error'
                );
            }

        } finally {

            setSubmitLoading(false);
        }
    };

    // =========================
    // SUPPRESSION
    // =========================

    const handleDelete = async (id) => {

        const result = await Swal.fire({
            title: 'Supprimer ?',
            text: 'Action irréversible',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) return;

        try {

            await api.delete(`/factures/${id}`);

            setFactures(prev =>
                prev.filter(f => f.id !== id)
            );

            Swal.fire(
                'Succès',
                'Facture supprimée',
                'success'
            );

        } catch (err) {

            console.error(err);

            Swal.fire(
                'Erreur',
                'Suppression impossible',
                'error'
            );
        }
    };

    // =========================
    // MODIFICATION
    // =========================

    const handleEdit = async (facture) => {

        try {

            const res = await api.get(
                `/factures/${facture.id}`
            );

            const data =
                res.data.data || res.data;

            let items = [];

            if (Array.isArray(data.items)) {

                items = data.items;

            } else if (
                typeof data.items === 'string'
            ) {

                items = JSON.parse(data.items);

            } else if (data.lignes) {

                items = data.lignes;
            }

            setFormData({

                id: data.id,

                client_id: data.client_id,

                date_emission:
                    data.date_emission,

                tva_taux:
                    data.tva_taux || 18,

                total_ht:
                    data.total_ht || 0,

                total_ttc:
                    data.total_ttc || 0,

                items: items.map(item => ({
                    designation:
                        item.designation || '',

                    quantite:
                        Number(item.quantite || 1),

                    prix_unitaire:
                        Number(
                            item.prix_unitaire || 0
                        )
                }))
            });

            setIsEditing(true);

            setShowModal(true);

        } catch (err) {

            console.error(err);

            Swal.fire(
                'Erreur',
                'Impossible de charger la facture',
                'error'
            );
        }
    };

    // =========================
    // PDF
    // =========================

    const generatePDF = async (
        facture,
        preview = true
    ) => {

        try {

            const res = await api.get(
                `/factures/${facture.id}`
            );

            const data =
                res.data.data || res.data;

            const doc = new jsPDF();

            const numFacture =
                data.numero_facture || data.id;

            // HEADER

            doc.setFontSize(20);

            doc.setTextColor(25, 135, 84);

            doc.text('Djago', 14, 20);

            doc.setTextColor(233, 114, 35);

            doc.text('Yelen', 40, 20);

            doc.setTextColor(0, 0, 0);

            try {

                doc.addImage(
                    logo,
                    'JPEG',
                    160,
                    8,
                    35,
                    35
                );

            } catch (err) {

                console.log(err);
            }

            doc.setFontSize(11);

            doc.text(
                `Facture N° ${numFacture}`,
                14,
                45
            );

            const date = new Date(
                data.date_emission
            ).toLocaleDateString('fr-FR');

            doc.text(
                `Date : ${date}`,
                14,
                53
            );

            // CLIENT

            const client = data.client || {};

            doc.setFont(
                'helvetica',
                'bold'
            );

            doc.text('CLIENT', 130, 45);

            doc.setFont(
                'helvetica',
                'normal'
            );

            doc.text(
                client.nom || '-',
                130,
                53
            );

            doc.text(
                client.telephone || '-',
                130,
                61
            );

            doc.text(
                client.email || '-',
                130,
                69
            );

            // ITEMS

            let items = [];

            if (Array.isArray(data.items)) {

                items = data.items;

            } else if (
                typeof data.items === 'string'
            ) {

                items = JSON.parse(data.items);

            } else if (data.lignes) {

                items = data.lignes;
            }

            const rows = items.map(item => {

                const qte =
                    Number(item.quantite || 0);

                const pu =
                    Number(
                        item.prix_unitaire || 0
                    );

                return [
                    item.designation,
                    qte,
                    `${formatPrix(pu)} F`,
                    `${formatPrix(qte * pu)} F`
                ];
            });

            autoTable(doc, {

                startY: 80,

                head: [[
                    'Désignation',
                    'Qté',
                    'PU',
                    'Montant'
                ]],

                body: rows,

                foot: [

                    [
                        '',
                        '',
                        'HT',
                        `${formatPrix(
                            data.total_ht
                        )} F`
                    ],

                    [
                        '',
                        '',
                        'TTC',
                        `${formatPrix(
                            data.total_ttc
                        )} F`
                    ]
                ],

                theme: 'grid',

                headStyles: {
                    fillColor: [25, 135, 84]
                },

                footStyles: {
                    fillColor: [233, 114, 35]
                }
            });

            // QR CODE

            const qrData = `
Facture : ${numFacture}
Client : ${client.nom}
Montant : ${data.total_ttc} F
`;

            const qrImage =
                await QRCode.toDataURL(qrData);

            doc.addImage(
                qrImage,
                'PNG',
                160,
                240,
                30,
                30
            );

            // =========================
            // CORRECTION PREVIEW MOBILE
            // =========================

            const blob = doc.output('blob');

            const blobUrl = URL.createObjectURL(blob);

            if (preview) {

                setPreviewUrl(blobUrl);

                setCurrentPdfName(
                    `Facture_${numFacture}.pdf`
                );

                setShowPreview(true);

            } else {

                const link =
                    document.createElement('a');

                link.href = blobUrl;

                link.download =
                    `Facture_${numFacture}.pdf`;

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);
            }

        } catch (err) {

            console.error(err);

            Swal.fire(
                'Erreur',
                'Impossible de générer le PDF',
                'error'
            );
        }
    };

    // =========================
    // DOWNLOAD PDF
    // =========================

    const handleDownloadPdf = () => {

        const link =
            document.createElement('a');

        link.href = previewUrl;

        link.download = currentPdfName;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    // =========================
    // OPEN PDF MOBILE
    // =========================

    const handleOpenPdfMobile = () => {

        window.open(
            previewUrl,
            '_blank'
        );
    };

    // =========================
    // CLOSE PREVIEW
    // =========================

    const closePreview = () => {

        setShowPreview(false);

        if (previewUrl) {

            URL.revokeObjectURL(previewUrl);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: '80vh' }}
            >
                <div className="spinner-border" />
            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <div className="container py-4">

            {/* =========================
    PREVIEW PDF
========================= */}

{showPreview && (

    <div
        className="modal show d-block"
        style={{
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999
        }}
    >
        <div
            className="modal-dialog modal-fullscreen-md-down modal-xl modal-dialog-centered"
            style={{
                maxWidth: '98%',
                margin: '10px auto'
            }}
        >
            <div
                className="modal-content"
                style={{
                    height: '95vh'
                }}
            >

                {/* HEADER */}

                <div className="modal-header">

                    <h5 className="modal-title">
                        Prévisualisation PDF
                    </h5>

                    <button
                        className="btn-close"
                        onClick={() => {

                            setShowPreview(false);

                            if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                            }
                        }}
                    />

                </div>

                {/* BODY */}

                <div
                    className="modal-body p-0"
                    style={{
                        height: '100%',
                        overflow: 'hidden',
                        backgroundColor: '#f1f1f1'
                    }}
                >

                    {/* =========================
                        MOBILE + DESKTOP
                    ========================= */}

                    <iframe
                        src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        title="Prévisualisation PDF"
                        width="100%"
                        height="100%"
                        style={{
                            border: 'none',
                            background: '#fff'
                        }}
                    />

                </div>

                {/* FOOTER */}

                <div className="modal-footer">

                    <button
                        className="btn btn-secondary"
                        onClick={() => {

                            setShowPreview(false);

                            if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                            }
                        }}
                    >
                        Fermer
                    </button>

                    <a
                        href={previewUrl}
                        download={currentPdfName}
                        className="btn btn-success"
                    >
                        Télécharger
                    </a>

                    <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        Ouvrir
                    </a>

                </div>

            </div>
        </div>
    </div>
)}

            {/* =========================
                LISTE
            ========================= */}

            {!showModal ? (

                <>

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h3>
                            Factures
                        </h3>

                        <button
                            className="btn btn-primary"
                            onClick={() => {

                                setShowModal(true);

                                setIsEditing(false);

                                setFormData(
                                    initialFormState
                                );
                            }}
                        >
                            + Nouvelle facture
                        </button>
                    </div>

                    <div className="table-responsive">

                        <table className="table table-hover align-middle">

                            <thead className="table-dark">

                                <tr>

                                    <th>N°</th>

                                    <th>Client</th>

                                    <th>Date</th>

                                    <th>Total</th>

                                    <th>
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
                                            {f.client?.nom}
                                        </td>

                                        <td>
                                            {f.date_emission}
                                        </td>

                                        <td className="fw-bold text-success">
                                            {formatPrix(
                                                f.total_ttc
                                            )} F
                                        </td>

                                        <td>

                                            <div className="btn-group">

                                                <button
                                                    className="btn btn-outline-success btn-sm"
                                                    onClick={() =>
                                                        generatePDF(
                                                            f,
                                                            true
                                                        )
                                                    }
                                                >
                                                    PDF
                                                </button>

                                                <button
                                                    className="btn btn-outline-warning btn-sm"
                                                    onClick={() =>
                                                        handleEdit(f)
                                                    }
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() =>
                                                        handleDelete(f.id)
                                                    }
                                                >
                                                    Supprimer
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

                <form onSubmit={handleSubmit}>

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {

                                setShowModal(false);

                                setErrors({});
                            }}
                        >
                            Retour
                        </button>

                        <h4>
                            {isEditing
                                ? 'Modifier facture'
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
                                className="form-control"
                                value={
                                    formData.client_id
                                }
                                onChange={e =>
                                    setFormData(prev => ({
                                        ...prev,
                                        client_id:
                                            Number(
                                                e.target.value
                                            )
                                    }))
                                }
                            >

                                <option value="">
                                    Choisir
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
                                +
                            </button>

                        </div>

                    </div>

                    {/* ITEMS */}

                    {formData.items.map((item, i) => (

                        <div
                            className="border rounded p-3 mb-3"
                            key={i}
                        >

                            <div className="row g-2">

                                <div className="col-md-5">

                                    <input
                                        className="form-control"
                                        placeholder="Désignation"
                                        value={
                                            item.designation
                                        }
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

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={
                                            item.quantite
                                        }
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

                                    <input
                                        type="number"
                                        className="form-control"
                                        value={
                                            item.prix_unitaire
                                        }
                                        onChange={e =>
                                            handleItemChange(
                                                i,
                                                'prix_unitaire',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="col-md-2">

                                    <button
                                        type="button"
                                        className="btn btn-danger w-100"
                                        onClick={() =>
                                            removeItem(i)
                                        }
                                    >
                                        X
                                    </button>

                                </div>

                            </div>

                        </div>
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-info mb-4"
                        onClick={addItem}
                    >
                        + Ajouter ligne
                    </button>

                    {/* TOTAL */}

                    <div className="card mb-4">

                        <div className="card-body">

                            <div className="d-flex justify-content-between">

                                <span>
                                    HT
                                </span>

                                <strong>
                                    {formatPrix(
                                        formData.total_ht
                                    )} F
                                </strong>

                            </div>

                            <div className="d-flex justify-content-between">

                                <span>
                                    TVA
                                </span>

                                <strong>
                                    {formatPrix(
                                        formData.total_ttc -
                                        formData.total_ht
                                    )} F
                                </strong>

                            </div>

                            <hr />

                            <div className="d-flex justify-content-between fs-5">

                                <span>
                                    TTC
                                </span>

                                <strong className="text-success">
                                    {formatPrix(
                                        formData.total_ttc
                                    )} F
                                </strong>

                            </div>

                        </div>

                    </div>

                    <button
                        className="btn btn-success w-100"
                        disabled={submitLoading}
                    >
                        {submitLoading
                            ? 'Chargement...'
                            : isEditing
                                ? 'Mettre à jour'
                                : 'Enregistrer'}
                    </button>

                </form>
            )}

            {/* =========================
                MODAL CLIENT
            ========================= */}

            {showClientModal && (

                <div
                    className="modal show d-block"
                    style={{
                        background:
                            'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog">

                        <div className="modal-content">

                            <div className="modal-header">

                                <h5>
                                    Nouveau client
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

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Nom"
                                        value={newClient.nom}
                                        onChange={e =>
                                            setNewClient(prev => ({
                                                ...prev,
                                                nom:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Email"
                                        value={newClient.email}
                                        onChange={e =>
                                            setNewClient(prev => ({
                                                ...prev,
                                                email:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                    <input
                                        className="form-control mb-2"
                                        placeholder="Téléphone"
                                        value={newClient.telephone}
                                        onChange={e =>
                                            setNewClient(prev => ({
                                                ...prev,
                                                telephone:
                                                    e.target.value
                                            }))
                                        }
                                    />

                                    <input
                                        className="form-control"
                                        placeholder="Adresse"
                                        value={newClient.adresse}
                                        onChange={e =>
                                            setNewClient(prev => ({
                                                ...prev,
                                                adresse:
                                                    e.target.value
                                            }))
                                        }
                                    />

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

                                    <button className="btn btn-success">

                                        Enregistrer

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Facture;