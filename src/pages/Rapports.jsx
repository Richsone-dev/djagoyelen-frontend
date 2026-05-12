import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- COMPOSANT SKELETON POUR LE CHARGEMENT ---
const SkeletonCard = () => (
    <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 h-100 placeholder-glow" style={{ borderRadius: '15px' }}>
            <div className="d-flex justify-content-between mb-3">
                <span className="placeholder col-4 py-2 rounded"></span>
                <span className="placeholder col-1 py-2 rounded"></span>
            </div>
            <div className="placeholder col-8 mb-2 py-2"></div>
            <div className="placeholder col-6 mb-4 py-2"></div>
            <div className="placeholder col-12 py-3 rounded-3"></div>
        </div>
    </div>
);

const Rapports = () => {
    const [reports, setReports] = useState({ daily: [], weekly: [], monthly: [] });
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailData, setDetailData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [showModal, setShowModal] = useState(false);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
        lightGray: '#f8f9fa'
    };

    const periodLabels = {
        daily: 'Journalier',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuel'
    };

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/summary');
            setReports(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des rapports", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

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
        return Number(prix || 0).toLocaleString('fr-FR');
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const periodTitle = periodLabels[selectedPeriod] || 'Financier';

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
            columnStyles: { 4: { halign: 'right' } },
            styles: { fontSize: 9, font: 'helvetica', cellPadding: 3 },
        });

        doc.save(`DjagoYelen_Rapport_${periodTitle.toLowerCase()}.pdf`);
    };

    const calculateTotal = (data) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => sum + Number(item.total || 0), 0);
    };

    return (
        <div className="p-0" style={{ backgroundColor: colors.lightGray, minHeight: '100vh' }}>
            <div className="container py-4">
                {/* HEADER */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div className="text-start">
                        <h2 style={{ color: colors.darkGreen }} className="fw-bold mb-1">
                            <i className="bi bi-bar-chart-line-fill me-2 text-success"></i>Rapports Financiers
                        </h2>
                        <p className="text-muted small mb-0">Analysez vos performances sur différentes périodes.</p>
                    </div>
                    <button className="btn btn-white shadow-sm border-0 rounded-pill px-3 py-2 text-start" onClick={fetchReports}>
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''} me-2 text-success`}></i>
                        <span className="small fw-bold">Actualiser les données</span>
                    </button>
                </div>

                {/* CARTES RÉSUMÉ (AVEC SKELETON) */}
                <div className="row g-3 mb-4">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        ['daily', 'weekly', 'monthly'].map((period) => {
                            const pColors = { daily: colors.darkGreen, weekly: colors.orange, monthly: colors.successGreen };
                            return (
                                <div className="col-md-4 text-start" key={period}>
                                    <div className="card border-0 shadow-sm p-3 h-100 transition-hover" 
                                         style={{ borderRadius: '18px', borderLeft: `6px solid ${pColors[period]}` }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="text-muted small fw-bold text-uppercase mb-0">{periodLabels[period]}</h6>
                                            <div className="rounded-circle p-2" style={{ backgroundColor: `${pColors[period]}15` }}>
                                                <i className="bi bi-calendar-check" style={{ color: pColors[period] }}></i>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2 flex-grow-1">
                                            {reports[period]?.length > 0 ? reports[period].map((item, idx) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-3 bg-light-subtle">
                                                    <span className={`small fw-medium ${item.type === 'depense' ? 'text-danger' : 'text-success'}`}>
                                                        <i className={`bi bi-arrow-${item.type === 'depense' ? 'down' : 'up'}-right me-1`}></i>
                                                        {item.type === 'depense' ? 'Dépenses' : 'Recettes'}
                                                    </span>
                                                    <strong className="text-dark">{formatPrix(item.total)} F</strong>
                                                </div>
                                            )) : (
                                                <div className="py-3 text-center">
                                                    <p className="text-muted small mb-0 fst-italic">Aucune activité</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleViewDetails(period)} 
                                            className="btn btn-sm mt-3 w-100 text-white shadow-sm border-0 py-2 fw-bold" 
                                            style={{backgroundColor: pColors[period], borderRadius: '12px'}}
                                            disabled={loadingDetails}
                                        >
                                            {loadingDetails && selectedPeriod === period ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : <i className="bi bi-eye me-2"></i>}
                                            Détails
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* RÉSUMÉ GLOBAL DYNAMIQUE */}
                <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: '20px' }}>
                    <h5 className="fw-bold mb-4 text-start" style={{ color: colors.darkGreen }}>
                        <i className="bi bi-lightning-charge-fill me-2 text-warning"></i>Flux cumulés par période
                    </h5>
                    <div className="row text-center g-4">
                        {[
                            { label: "Aujourd'hui", key: 'daily', color: colors.orange },
                            { label: "Semaine", key: 'weekly', color: colors.darkGreen },
                            { label: "Ce mois", key: 'monthly', color: colors.successGreen }
                        ].map((item, index) => (
                            <div key={index} className={`col-md-4 ${index !== 2 ? 'border-end-md' : ''}`}>
                                <h6 className="text-muted small mb-2">{item.label}</h6>
                                {loading ? (
                                    <div className="placeholder-glow"><span className="placeholder col-6 py-3 rounded"></span></div>
                                ) : (
                                    <h4 className="fw-bold mb-0" style={{ color: item.color }}>{formatPrix(calculateTotal(reports[item.key]))} <small style={{fontSize: '0.6em'}}>F</small></h4>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* MODALE DÉTAILS OPTIMISÉE */}
                {showModal && (
                    <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(10,59,47,0.4)', backdropFilter: 'blur(6px)', zIndex: 1060}}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg" style={{borderRadius: '24px', overflow: 'hidden'}}>
                                <div className="modal-header border-0 text-white p-4" style={{backgroundColor: colors.darkGreen}}>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-white rounded-3 p-2 me-3">
                                            <i className="bi bi-file-earmark-text text-success fs-4"></i>
                                        </div>
                                        <div>
                                            <h5 className="modal-title fw-bold mb-0">{periodLabels[selectedPeriod]}</h5>
                                            <small className="opacity-75">Historique des transactions</small>
                                        </div>
                                    </div>
                                    <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body p-0" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="bg-light sticky-top">
                                                <tr className="small text-muted text-uppercase">
                                                    <th className="ps-4 py-3">Date</th>
                                                    <th>Description</th>
                                                    <th>Type</th>
                                                    <th className="text-end pe-4">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailData.length > 0 ? detailData.map((t, i) => (
                                                    <tr key={i}>
                                                        <td className="ps-4 small text-muted">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                                                        <td className="fw-bold text-dark">{t.description || 'N/A'}</td>
                                                        <td>
                                                            <span className={`badge rounded-pill px-3 py-2 ${t.type === 'depense' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                                                                {t.type === 'depense' ? 'Dépense' : 'Recette'}
                                                            </span>
                                                        </td>
                                                        <td className={`text-end fw-bold pe-4 ${t.type === 'depense' ? 'text-dark' : 'text-success'}`}>
                                                            {formatPrix(t.montant)} F
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="text-center py-5 text-muted">Aucune donnée.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 bg-light p-4">
                                    <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Fermer</button>
                                    <button className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={downloadPDF} disabled={detailData.length === 0}>
                                        <i className="bi bi-download me-2"></i>Télécharger PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .transition-hover { transition: transform 0.3s ease, shadow 0.3s ease; cursor: default; }
                .transition-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
                .spin { animation: spin 1s linear infinite; display: inline-block; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @media (min-width: 768px) {
                    .border-end-md { border-right: 1px solid #dee2e6 !important; }
                }
            `}</style>
        </div>
    );
};

export default Rapports;