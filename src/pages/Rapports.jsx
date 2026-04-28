import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Rapports = () => {
    const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false); // État de chargement pour la modale
    const [detailData, setDetailData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [showModal, setShowModal] = useState(false);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754'
    };

    const periodLabels = {
        daily: 'Journalier',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuel'
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/reports/summary');
            setReports(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des rapports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (period) => {
        setSelectedPeriod(period);
        setLoadingDetails(true);
        try {
            const res = await api.get(`/reports/details?period=${period}`);
            setDetailData(res.data.transactions || []);
            setShowModal(true);
        } catch (error) { 
            console.error("Erreur lors de la récupération des détails", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const formatPrix = (prix) => {
        return Number(prix)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const periodTitle = periodLabels[selectedPeriod] || 'Financier';

        // En-tête PDF
        doc.setFontSize(20);
        doc.setTextColor(10, 59, 47);
        doc.text(`DjagoYelen - Rapport ${periodTitle}`, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Date d'export : ${new Date().toLocaleString('fr-FR')}`, 14, 28);

        const tableColumn = ["Date", "Description", "Catégorie", "Type", "Montant"];
        const tableRows = detailData.map(t => [
            new Date(t.created_at).toLocaleDateString('fr-FR'),
            t.description || 'N/A',
            t.category?.nom || 'Autre',
            t.type === 'depense' ? 'DÉPENSE' : 'RECETTE',
            formatPrix(t.montant) + ' FCFA'
        ]);

        autoTable(doc, {
            startY: 35,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [10, 59, 47], halign: 'center' },
            columnStyles: { 4: { halign: 'right' } }, // Montant aligné à droite
            styles: { fontSize: 9, font: 'helvetica', cellPadding: 3 },
        });

        doc.save(`DjagoYelen_Rapport_${periodTitle.toLowerCase()}.pdf`);
    };

    const calculateTotal = (data) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => sum + Number(item.total || 0), 0);
    };

    if (loading) return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '80vh'}}>
            <div className="spinner-border" style={{color: colors.orange}} role="status"></div>
            <p className="mt-3 text-muted fw-bold">Analyse des finances en cours...</p>
        </div>
    );

    return (
        <div className="p-0" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 style={{ color: colors.darkGreen }} className="fw-bold mb-0">📊 Rapports Financiers</h2>
                    <button className="btn btn-outline-secondary btn-sm" onClick={fetchReports}>
                        <i className="bi bi-arrow-clockwise"></i> Actualiser
                    </button>
                </div>

                {/* Cartes Résumé */}
                <div className="row g-3 mb-4">
                    {['daily', 'weekly', 'monthly'].map((period) => {
                        const pColors = { daily: colors.darkGreen, weekly: colors.orange, monthly: colors.successGreen };
                        return (
                            <div className="col-md-4" key={period}>
                                <div className="card border-0 shadow-sm p-3 h-100" style={{ borderRadius: '15px', borderLeft: `5px solid ${pColors[period]}` }}>
                                    <div className="d-flex justify-content-between">
                                        <h6 className="text-muted small fw-bold text-uppercase">{periodLabels[period]}</h6>
                                        <i className="bi bi-calendar-event text-muted"></i>
                                    </div>
                                    <div className="mt-3 flex-grow-1">
                                        {reports[period]?.length > 0 ? reports[period].map((item, idx) => (
                                            <div key={idx} className="d-flex justify-content-between align-items-center mb-2">
                                                <span className={`small badge ${item.type === 'depense' ? 'text-danger' : 'text-success'}`}>
                                                    {item.type === 'depense' ? 'Sorties' : 'Entrées'}
                                                </span>
                                                <strong className={item.type === 'depense' ? 'text-dark' : 'text-success'}>
                                                    {formatPrix(item.total)}
                                                </strong>
                                            </div>
                                        )) : <p className="text-muted small italic">Aucun flux enregistré</p>}
                                    </div>
                                    <button 
                                        onClick={() => handleViewDetails(period)} 
                                        className="btn btn-sm mt-3 w-100 text-white shadow-sm" 
                                        style={{backgroundColor: pColors[period], borderRadius: '8px'}}
                                        disabled={loadingDetails}
                                    >
                                        {loadingDetails && selectedPeriod === period ? 'Chargement...' : 'Voir l\'historique'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Résumé Global */}
                <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '15px' }}>
                    <h5 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                        <i className="bi bi-graph-up-arrow me-2"></i>Résumé des flux cumulés
                    </h5>
                    <div className="row text-center g-4">
                        <div className="col-md-4 border-end-md">
                            <h6 className="text-muted small">Volume Aujourd'hui</h6>
                            <h4 className="fw-bold mb-0" style={{ color: colors.orange }}>{formatPrix(calculateTotal(reports.daily))}</h4>
                        </div>
                        <div className="col-md-4 border-end-md">
                            <h6 className="text-muted small">Volume Semaine</h6>
                            <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>{formatPrix(calculateTotal(reports.weekly))}</h4>
                        </div>
                        <div className="col-md-4">
                            <h6 className="text-muted small">Volume Mois</h6>
                            <h4 className="fw-bold mb-0" style={{ color: colors.successGreen }}>{formatPrix(calculateTotal(reports.monthly))}</h4>
                        </div>
                    </div>
                </div>

                {/* MODALE HISTORIQUE */}
                {showModal && (
                    <div className="modal d-block animate__animated animate__fadeIn" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'}}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '18px', overflow: 'hidden'}}>
                                <div className="modal-header border-0 text-white p-4" style={{backgroundColor: colors.darkGreen}}>
                                    <h5 className="modal-title fw-bold">
                                        <i className="bi bi-clock-history me-2"></i>Détails : {periodLabels[selectedPeriod]}
                                    </h5>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-0" style={{maxHeight: '55vh', overflowY: 'auto'}}>
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="ps-4">Date</th>
                                                <th>Description</th>
                                                <th>Type</th>
                                                <th className="text-end pe-4">Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailData.length > 0 ? detailData.map((t, i) => (
                                                <tr key={i}>
                                                    <td className="ps-4 small text-muted">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                                                    <td className="fw-medium">{t.description || 'Sans description'}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${t.type === 'depense' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                            {t.type === 'depense' ? 'Dépense' : 'Recette'}
                                                        </span>
                                                    </td>
                                                    <td className={`text-end fw-bold pe-4 ${t.type === 'depense' ? 'text-dark' : 'text-success'}`}>
                                                        {formatPrix(t.montant)}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="text-center py-5 text-muted">Aucune transaction trouvée pour cette période.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer border-0 bg-light p-3">
                                    <button className="btn btn-light px-4 fw-bold" onClick={() => setShowModal(false)} style={{borderRadius: '10px'}}>Fermer</button>
                                    <button className="btn btn-success px-4 fw-bold shadow-sm" onClick={downloadPDF} disabled={detailData.length === 0} style={{borderRadius: '10px'}}>
                                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Exporter PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rapports;