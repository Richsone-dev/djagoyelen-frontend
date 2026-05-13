import React, { useState, useEffect } from 'react';
import api from '../api/axios';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

import Swal from 'sweetalert2';

import logo from '../assets/djago-logo.jpeg';

const Facture = () => {

    // ─────────────────────────────────────
    // STATES
    // ─────────────────────────────────────

    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const [showClientModal, setShowClientModal] = useState(false);

    const [showPreview, setShowPreview] = useState(false);

    const [previewUrl, setPreviewUrl] = useState('');

    const [submitLoading, setSubmitLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [errors, setErrors] = useState({});

    // ─────────────────────────────────────
    // COLORS
    // ─────────────────────────────────────

    const colors = {
        successGreen: '#198754',
        orange: '#E97223',
        dangerRed: '#dc3545',
        lightGray: '#f8f9fa'
    };

    // ─────────────────────────────────────
    // CLIENT
    // ─────────────────────────────────────

    const [newClient, setNewClient] = useState({
        nom: '',
        email: '',
        telephone: '',
        adresse: ''
    });

    // ─────────────────────────────────────
    // FORMULAIRE
    // ─────────────────────────────────────

    const initialFormState = {
        id: null,
        client_id: '',
        date_emission: new Date()
            .toISOString()
            .split('T')[0],

        items: [
            {
                designation: '',
                quantite: 1,
                prix_unitaire: 0
            }
        ],

        tva_taux: 18,
        total_ht: 0,
        total_ttc: 0
    };

    const [formData, setFormData] =
        useState(initialFormState);

    // ─────────────────────────────────────
    // FETCH
    // ─────────────────────────────────────

    useEffect(() => {

        fetchFactures();

        fetchClients();

    }, []);

    const fetchFactures = async () => {

        try {

            const res =
                await api.get('/factures');

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];

            setFactures(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };

    const fetchClients = async () => {

        try {

            const res =
                await api.get('/clients');

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.data || [];

            setClients(data);

        } catch (err) {

            console.error(err);
        }
    };

    // ─────────────────────────────────────
    // CALCULS
    // ─────────────────────────────────────

    useEffect(() => {

        const ht = formData.items.reduce(
            (sum, item) => {

                const qte =
                    Number(item.quantite || 0);

                const pu =
                    Number(item.prix_unitaire || 0);

                return sum + (qte * pu);

            },
            0
        );

        const tva =
            ht *
            (Number(formData.tva_taux) / 100);

        const ttc = ht + tva;

        setFormData(prev => ({
            ...prev,
            total_ht: Number(ht.toFixed(2)),
            total_ttc: Number(ttc.toFixed(2))
        }));

    }, [
        formData.items,
        formData.tva_taux
    ]);

    // ─────────────────────────────────────
    // FORMAT PRIX
    // ─────────────────────────────────────

    const formatPrix = value => {

        return Number(value || 0)
            .toLocaleString('fr-FR');
    };

    // ─────────────────────────────────────
    // AJOUT CLIENT
    // ─────────────────────────────────────

    const handleAddClient = async e => {

        e.preventDefault();

        try {

            const res =
                await api.post(
                    '/clients',
                    newClient
                );

            const client =
                res.data.data || res.data;

            setClients(prev => [
                ...prev,
                client
            ]);

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

    // ─────────────────────────────────────
    // ITEMS
    // ─────────────────────────────────────

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

    const removeItem = index => {

        if (formData.items.length === 1)
            return;

        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(
                (_, i) => i !== index
            )
        }));
    };

    // ─────────────────────────────────────
    // ENREGISTREMENT FACTURE
    // ─────────────────────────────────────

    const handleSubmit = async e => {

        e.preventDefault();

        setErrors({});

        setSubmitLoading(true);

        try {

            const payload = {

                client_id:
                    Number(
                        formData.client_id
                    ),

                date_emission:
                    formData.date_emission,

                tva_taux:
                    Number(
                        formData.tva_taux
                    ),

                total_ht:
                    Number(
                        formData.total_ht
                    ),

                total_ttc:
                    Number(
                        formData.total_ttc
                    ),

                items:
                    formData.items.map(
                        item => ({
                            designation:
                                item.designation,

                            quantite:
                                Number(
                                    item.quantite
                                ),

                            prix_unitaire:
                                Number(
                                    item.prix_unitaire
                                )
                        })
                    )
            };

            if (
                isEditing &&
                formData.id
            ) {

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

    // ─────────────────────────────────────
    // SUPPRESSION
    // ─────────────────────────────────────

    const handleDelete = async id => {

        const result =
            await Swal.fire({

                title:
                    'Supprimer cette facture ?',

                text:
                    'Action irréversible',

                icon: 'warning',

                showCancelButton: true,

                confirmButtonText: 'Oui',

                cancelButtonText:
                    'Annuler'
            });

        if (!result.isConfirmed)
            return;

        try {

            await api.delete(
                `/factures/${id}`
            );

            setFactures(prev =>
                prev.filter(
                    f => f.id !== id
                )
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

    // ─────────────────────────────────────
    // MODIFICATION
    // ─────────────────────────────────────

    const handleEdit = facture => {

        const items =
            typeof facture.items ===
            'string'
                ? JSON.parse(
                    facture.items
                )
                : facture.items || [];

        setFormData({

            id: facture.id,

            client_id:
                facture.client_id,

            date_emission:
                facture.date_emission,

            tva_taux:
                facture.tva_taux || 18,

            total_ht:
                facture.total_ht || 0,

            total_ttc:
                facture.total_ttc || 0,

            items
        });

        setIsEditing(true);

        setShowModal(true);
    };

    // ─────────────────────────────────────
    // PDF + MOBILE FIX
    // ─────────────────────────────────────

    const generatePDF = async facture => {

        try {

            const res =
                await api.get(
                    `/factures/${facture.id}`
                );

            const fullFacture =
                res.data.data || res.data;

            const doc = new jsPDF();

            const numFacture =
                fullFacture.numero_facture ||
                fullFacture.id;

            // HEADER

            doc.setFontSize(18);

            doc.setFont(
                'helvetica',
                'bold'
            );

            doc.setTextColor(
                25,
                135,
                84
            );

            doc.text(
                'DjagoYelen',
                14,
                20
            );

            doc.setFontSize(10);

            doc.setTextColor(0);

            doc.text(
                'Services Numériques & Gestion financière',
                14,
                27
            );

            try {

                doc.addImage(
                    logo,
                    'JPEG',
                    165,
                    8,
                    28,
                    28
                );

            } catch (err) {

                console.log(err);
            }

            doc.setDrawColor(
                233,
                114,
                35
            );

            doc.line(
                14,
                35,
                196,
                35
            );

            // INFOS

            const date =
                new Date(
                    fullFacture.date_emission
                ).toLocaleDateString(
                    'fr-FR'
                );

            doc.setFontSize(11);

            doc.text(
                `Facture : ${numFacture}`,
                14,
                45
            );

            doc.text(
                `Date : ${date}`,
                14,
                52
            );

            doc.text(
                `Client : ${fullFacture.client?.nom || '-'
                }`,
                14,
                59
            );

            // ITEMS

            let items = [];

            if (fullFacture.lignes) {

                items =
                    fullFacture.lignes;

            } else if (
                typeof fullFacture.items ===
                'string'
            ) {

                items = JSON.parse(
                    fullFacture.items
                );

            } else {

                items =
                    fullFacture.items || [];
            }

            const rows = items.map(i => {

                const qte =
                    Number(
                        i.quantite || 0
                    );

                const pu =
                    Number(
                        i.prix_unitaire || 0
                    );

                return [

                    i.designation,

                    qte,

                    `${formatPrix(
                        pu
                    )} F`,

                    `${formatPrix(
                        qte * pu
                    )} F`
                ];
            });

            autoTable(doc, {

                startY: 70,

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
                            fullFacture.total_ht
                        )} F`
                    ],

                    [
                        '',
                        '',
                        'TVA',
                        `${formatPrix(
                            fullFacture.total_ttc -
                            fullFacture.total_ht
                        )} F`
                    ],

                    [
                        '',
                        '',
                        'TTC',
                        `${formatPrix(
                            fullFacture.total_ttc
                        )} F`
                    ]
                ],

                theme: 'grid',

                styles: {

                    fontSize: 9,

                    halign: 'center'
                },

                headStyles: {

                    fillColor: [
                        25,
                        135,
                        84
                    ]
                },

                footStyles: {

                    fillColor: [
                        233,
                        114,
                        35
                    ]
                }
            });

            // QR CODE

            const qrData = `
Facture: ${numFacture}
Client: ${fullFacture.client?.nom}
Montant: ${formatPrix(fullFacture.total_ttc)} F
`;

            const qrImage =
                await QRCode.toDataURL(
                    qrData
                );

            doc.addImage(
                qrImage,
                'PNG',
                160,
                45,
                25,
                25
            );

            // ─────────────────────────────
            // MOBILE FIX
            // ─────────────────────────────

            const pdfBlob =
                doc.output('blob');

            const pdfUrl =
                URL.createObjectURL(
                    pdfBlob
                );

            // MOBILE
            if (
                /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent
                )
            ) {

                window.open(
                    pdfUrl,
                    '_blank'
                );

                return;
            }

            // DESKTOP
            setPreviewUrl(pdfUrl);

            setShowPreview(true);

        } catch (err) {

            console.error(err);

            Swal.fire(
                'Erreur',
                'Impossible de générer le PDF',
                'error'
            );
        }
    };

    // ─────────────────────────────────────
    // LOADING
    // ─────────────────────────────────────

    if (loading) {

        return (

            <div
                className="d-flex justify-content-center align-items-center"
                style={{
                    height: '80vh'
                }}
            >
                <div className="spinner-border text-success" />
            </div>
        );
    }

    // ─────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────

    return (

        <div className="container py-4">

            {/* PREVIEW DESKTOP */}

            {showPreview && (

                <div
                    className="modal show d-block"
                    style={{
                        background:
                            'rgba(0,0,0,0.7)',
                        zIndex: 9999
                    }}
                >
                    <div
                        className="modal-dialog modal-xl"
                        style={{
                            maxWidth: '95%'
                        }}
                    >
                        <div className="modal-content">

                            <div className="modal-header">

                                <h5>
                                    Prévisualisation PDF
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => {

                                        setShowPreview(false);

                                        URL.revokeObjectURL(
                                            previewUrl
                                        );
                                    }}
                                />
                            </div>

                            <div
                                className="modal-body p-0"
                                style={{
                                    height: '80vh'
                                }}
                            >
                                <iframe
                                    src={previewUrl}
                                    width="100%"
                                    height="100%"
                                    title="PDF"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* LISTE */}

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
                                                        generatePDF(f)
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

            {/* MODAL CLIENT */}

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