import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const Reports = () => {
    const [reports, setReports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports/summary');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Erreur lors de la récupération des rapports", error);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-success" role="status"></div>
        </div>
    );

    // Fonction pour extraire les montants selon le type
    const getTotals = (data) => {
        const depense = data.find(item => item.type === 'depense')?.total || 0;
        const revenu = data.find(item => item.type === 'revenu')?.total || 0;
        return { depense: Number(depense), revenu: Number(revenu), solde: revenu - depense };
    };

    const ReportCard = ({ title, data, icon }) => {
        const { depense, revenu, solde } = getTotals(data);
        const ratio = revenu > 0 ? Math.min((depense / revenu) * 100, 100) : (depense > 0 ? 100 : 0);

        return (
            <div className="col-12 col-lg-4 mb-4">
                <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '20px' }}>
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold text-muted text-uppercase mb-0" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                                {title}
                            </h6>
                            <i className={`bi ${icon} fs-4`} style={{ color: '#E97223' }}></i>
                        </div>

                        <div className="mb-4">
                            <h3 className={`fw-bold ${solde >= 0 ? 'text-dark' : 'text-danger'}`}>
                                {solde.toLocaleString()} <small style={{ fontSize: '1rem' }}>CFA</small>
                            </h3>
                            <span className="small text-muted">Solde net disponible</span>
                        </div>

                        <div className="row g-0 mb-3">
                            <div className="col-6 border-end pe-2">
                                <small className="d-block text-muted">Revenus</small>
                                <span className="fw-bold text-success">+{revenu.toLocaleString()}</span>
                            </div>
                            <div className="col-6 ps-3">
                                <small className="d-block text-muted">Dépenses</small>
                                <span className="fw-bold text-danger">-{depense.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Barre de santé financière : Ratio Dépenses/Revenus */}
                        <div className="mt-4">
                            <div className="d-flex justify-content-between mb-1">
                                <small className="fw-bold" style={{ fontSize: '0.7rem' }}>NIVEAU DE DÉPENSE</small>
                                <small className="text-muted">{Math.round(ratio)}%</small>
                            </div>
                            <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                                <div 
                                    className={`progress-bar ${ratio > 80 ? 'bg-danger' : 'bg-success'}`} 
                                    role="progressbar" 
                                    style={{ width: `${ratio}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid px-3 px-md-4 py-4">
            <div className="row mb-4">
                <div className="col-12 text-center text-md-start">
                    <h2 className="fw-bold h3" style={{ color: '#0A3B2F' }}>Analyse de vos flux</h2>
                    <p className="text-muted">Rapports automatiques basés sur vos dernières activités.</p>
                </div>
            </div>

            <div className="row">
                <ReportCard title="Aujourd'hui" data={reports.daily} icon="bi-calendar-event" />
                <ReportCard title="7 Derniers Jours" data={reports.weekly} icon="bi-calendar-range" />
                <ReportCard title="Ce Mois-ci" data={reports.monthly} icon="bi-calendar-check" />
            </div>

            {/* --- CONSEIL IA (Optionnel pour ta soutenance) --- */}
            <div className="row mt-2">
                <div className="col-12">
                    <div className="p-3 bg-light rounded-3 border d-flex align-items-center">
                        <i className="bi bi-lightbulb-fill text-warning fs-3 me-3"></i>
                        <div>
                            <p className="mb-0 small fw-medium">
                                <strong>Astuce DjagoYelen :</strong> 
                                {getTotals(reports.monthly).solde < 0 
                                    ? " Vos dépenses dépassent vos revenus ce mois-ci. Pensez à limiter les achats non essentiels." 
                                    : " Votre gestion est saine ce mois-ci. C'est le bon moment pour alimenter votre épargne !"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;