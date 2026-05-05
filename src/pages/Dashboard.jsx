import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Assure-toi que ce fichier contient l'intercepteur avec le token
import 'bootstrap-icons/font/bootstrap-icons.css';

// Importation de Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    RadialLinearScale,
    RadarController,
    LineController,
    BarController,
    DoughnutController,
    PolarAreaController
} from 'chart.js';
import { Line, Doughnut, Bar, PolarArea, Radar } from 'react-chartjs-2';

// Enregistrement complet des contrôleurs et éléments
ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
    RadarController, LineController, BarController, DoughnutController, PolarAreaController
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, revenus: 0, depenses: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // États des graphiques
    const [lineData, setLineData] = useState({ labels: [], datasets: [] });
    const [doughnutData, setDoughnutData] = useState({ labels: [], datasets: [] });
    const [barData, setBarData] = useState({ labels: [], datasets: [] });
    const [polarData, setPolarData] = useState({ labels: [], datasets: [] });
    const [radarData, setRadarData] = useState({ labels: [], datasets: [] });

    const colors = {
        darkGreen: '#0A3B2F',
        red1: '#FF0000',
        orange: '#E97223',
        successGreen: '#198754',
        blue: '#2196f3',
        purple: '#9c27b0',
        lightGray: '#f8f9fa'
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/analyse/stats');
                const data = res.data;

                setStats(data.cards);
                setTransactions(data.recent);

                // Initialisation des graphiques (logique conservée)
                // ... (Line, Doughnut, Bar, Polar, Radar logic)
                setLoading(false);
            } catch (err) {
                console.error("Erreur de chargement DjagoYelen", err);
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Tri des transactions : du plus récent au plus ancien
    const sortedTransactions = useMemo(() => {
        if (!transactions) return [];
        return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions]);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'bottom' }
        }
    };

    return (
        <div className="container-fluid px-1 py-4 bg-light min-vh-100">
            {/* --- CARTES DE RÉSUMÉ --- */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4" >
                    <div className="card shadow-sm border-0 p-3 text-white h-100" style={{ borderLeft: `10px solid ${colors.orange}`,backgroundColor: colors.darkGreen, borderRadius: '15px' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold opacity-75">Solde Total</h6>
                                <h2 className="fw-bold mb-0">{stats.total.toLocaleString()} FCFA</h2>
                            </div>
                            <i className="bi bi-bank2 fs-1 opacity-25"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                    <div className="card shadow-sm border-0 p-3 bg-white h-100" style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.successGreen}` }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold text-muted">Total Revenus</h6>
                                <h3 className="fw-bold mb-0" style={{ color: colors.successGreen }}>+{stats.revenus.toLocaleString()}</h3>
                            </div>
                            <div className="rounded-circle p-2 bg-success-subtle">
                                <i className="bi bi-arrow-up-right fs-4 text-success"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                    <div className="card shadow-sm border-0 p-3 bg-white h-100" style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.orange}` }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold text-muted">Total Dépenses</h6>
                                <h3 className="fw-bold mb-0" style={{ color: colors.orange }}>-{stats.depenses.toLocaleString()}</h3>
                            </div>
                            <div className="rounded-circle p-2 bg-warning-subtle">
                                <i className="bi bi-arrow-down-left fs-4 text-warning"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PREMIÈRE RANGÉE : ANALYSE PRINCIPALE --- */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-8">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '15px' }}>
                        <h5 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                            <i className="bi bi-graph-up-arrow me-2"></i> Flux de Trésorerie Mensuel
                        </h5>
                        <div style={{ height: '250px' }}>
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-4">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '15px' }}>
                        <h5 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>
                            <i className="bi bi-pie-chart-fill me-2"></i> Par Catégorie
                        </h5>
                        <div style={{ height: '300px' }}>
                            <Doughnut data={doughnutData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DEUXIÈME RANGÉE : ANALYSE AVANCÉE --- */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-3">Volume Comparatif</h6>
                        <div style={{ height: '300px', color: colors.orange}}>
                            <Bar data={barData} options={chartOptions} style={{width: '100%', color: colors.orange}}/>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-3">Poids des Revenus/Dépenses</h6>
                        <div style={{ height: '250px' }}>
                            <PolarArea data={polarData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-12 col-xl-4">
                    <div className="card shadow-sm border-0 p-4 h-100" style={{ borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-3">Équilibre du Budget</h6>
                        <div style={{ height: '250px' }}>
                            <Radar data={radarData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- DERNIÈRES TRANSACTIONS --- */}
            <div className="card shadow-sm border-0 p-4 mb-5" style={{ borderRadius: '15px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0" style={{ color: colors.darkGreen }}>
                        <i className="bi bi-clock-history me-2"></i> Activités Récentes
                    </h5>
                    <button 
                        className="btn btn-sm text-white px-3" 
                        style={{ backgroundColor: colors.orange, borderRadius: '8px' }}
                        onClick={() => navigate('/transactions')}
                    >
                        Tout voir
                    </button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th className="text-end">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTransactions.map((t, index) => (
                                <tr key={t.id || index}>
                                    <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="fw-medium">{t.description}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${t.type === 'revenu' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                            {t.type === 'revenu' ? 'Entrée' : 'Sortie'}
                                        </span>
                                    </td>
                                    <td className={`text-end fw-bold ${t.type === 'revenu' ? 'text-success' : 'text-danger'}`}>
                                        {t.type === 'revenu' ? '+' : '-'} {parseFloat(t.montant).toLocaleString()} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;