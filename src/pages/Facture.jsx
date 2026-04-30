import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select';

const Facture = () => {

    // ------------------ STATES ------------------
    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedFacture, setSelectedFacture] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);

    const [newClient, setNewClient] = useState({
        nom: '', email: '', telephone: '', adresse: ''
    });

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

    // ------------------ FETCH DATA ------------------
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [resFactures, resClients] = await Promise.all([
                api.get('/factures'),
                api.get('/clients')
            ]);

            setFactures(resFactures.data?.data || resFactures.data || []);
            setClients(resClients.data?.data || resClients.data || []);

        } catch (error) {
            console.error("Erreur API :", error.response || error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ------------------ CLIENT OPTIONS ------------------
    const clientOptions = clients.map(c => ({
        value: c.id,
        label: `${c.nom} (${c.telephone})`
    }));

    // ------------------ FILTER ------------------
    const filteredFactures = factures.filter(f => {
        const search = searchTerm.toLowerCase();
        return (
            f.client?.nom?.toLowerCase().includes(search) ||
            f.client?.telephone?.toLowerCase().includes(search)
        );
    });

    // ------------------ CALCUL ------------------
    useEffect(() => {
        const ht = formData.items.reduce(
            (sum, item) =>
                sum + Number(item.quantite || 0) * Number(item.prix_unitaire || 0),
            0
        );

        const tva = ht * (Number(formData.tva_taux) / 100);

        setFormData(prev => ({
            ...prev,
            total_ht: ht,
            total_ttc: ht + tva
        }));
    }, [formData.items, formData.tva_taux]);

    const formatPrix = (prix) =>
        Number(prix).toLocaleString('fr-FR');

    // ------------------ CRUD ------------------
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
            if (isEditing) {
                await api.put(`/factures/${formData.id}`, formData);
            } else {
                await api.post('/factures', formData);
            }

            setView('list');
            setFormData(initialFormState);
            fetchData();

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer cette facture ?")) {
            try {
                await api.delete(`/factures/${id}`);
                fetchData();
            } catch {
                alert("Erreur suppression");
            }
        }
    };

    const handleItemChange = (idx, field, value) => {
        const newItems = [...formData.items];
        newItems[idx][field] =
            field === 'designation' ? value : Number(value);

        setFormData({ ...formData, items: newItems });
    };

    const handleQuickAddClient = async (e) => {
        e.preventDefault();

        try {
            const res = await api.post('/clients', newClient);

            setClients(prev => [...prev, res.data]);
            setFormData({ ...formData, client_id: res.data.id });

            setShowClientModal(false);
            setNewClient({ nom: '', email: '', telephone: '', adresse: '' });

        } catch {
            alert("Erreur ajout client");
        }
    };

    // ------------------ PDF ------------------
    const generatePDF = (facture) => {
        const doc = new jsPDF();

        doc.text(`Facture N° ${facture.num_facture}`, 10, 10);
        doc.text(`Client: ${facture.client?.nom}`, 10, 20);

        autoTable(doc, {
            startY: 30,
            head: [['Désignation', 'Qté', 'Prix', 'Total']],
            body: (facture.items || []).map(i => [
                i.designation,
                i.quantite,
                i.prix_unitaire,
                i.quantite * i.prix_unitaire
            ])
        });

        doc.save(`facture_${facture.num_facture}.pdf`);
    };

    // ------------------ LOADING ------------------
    if (loading) {
        return <div className="text-center mt-5">Chargement...</div>;
    }

    // ------------------ UI ------------------
    return (
        <div className="container py-4">

            {view === 'list' ? (
                <>
                    <h3>Factures</h3>

                    <input
                        className="form-control mb-3"
                        placeholder="Recherche client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <button
                        className="btn btn-success mb-3"
                        onClick={() => {
                            setIsEditing(false);
                            setFormData(initialFormState);
                            setView('form');
                        }}
                    >
                        + Nouvelle facture
                    </button>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Client</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredFactures.map(f => (
                                <tr key={f.id}>
                                    <td>{f.num_facture}</td>
                                    <td>{f.client?.nom}</td>
                                    <td>{formatPrix(f.total_ttc)}</td>
                                    <td>
                                        <button onClick={() => handleEdit(f)}>✏️</button>
                                        <button onClick={() => handleDelete(f.id)}>🗑</button>
                                        <button onClick={() => generatePDF(f)}>📄</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h3>{isEditing ? 'Modifier' : 'Créer'} Facture</h3>

                    <Select
                        options={clientOptions}
                        value={clientOptions.find(c => c.value === formData.client_id)}
                        onChange={(selected) =>
                            setFormData({ ...formData, client_id: selected.value })
                        }
                    />

                    <input
                        type="date"
                        className="form-control my-2"
                        value={formData.date_emission}
                        onChange={(e) =>
                            setFormData({ ...formData, date_emission: e.target.value })
                        }
                    />

                    {formData.items.map((item, i) => (
                        <div key={i} className="row mb-2">
                            <div className="col">
                                <input
                                    className="form-control"
                                    placeholder="Désignation"
                                    value={item.designation}
                                    onChange={(e) =>
                                        handleItemChange(i, 'designation', e.target.value)
                                    }
                                />
                            </div>
                            <div className="col">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.quantite}
                                    onChange={(e) =>
                                        handleItemChange(i, 'quantite', e.target.value)
                                    }
                                />
                            </div>
                            <div className="col">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.prix_unitaire}
                                    onChange={(e) =>
                                        handleItemChange(i, 'prix_unitaire', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    <h4>Total: {formatPrix(formData.total_ttc)}</h4>

                    <button className="btn btn-primary mt-3">
                        Enregistrer
                    </button>
                </form>
            )}
        </div>
    );
};

export default Facture;