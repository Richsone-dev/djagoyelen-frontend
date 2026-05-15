import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
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
    Colors,
} from 'chart.js';
import { Line, Doughnut, Bar, PolarArea, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- COMPOSANT DE CHARGEMENT RÉUTILISABLE ---
const LoaderOverlay = ({ message = "Chargement..." }) => (
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
         style={{ backgroundColor: 'rgba(255,255,255,1)', zIndex: 10, borderRadius: '15px' }}>
        <div className="spinner-border text-warning mb-2" role="status" style={{ width: '1.5rem', height: '1.5rem', backgroundColor: Colors.successGreen}}></div>
        <span className="small fw-bold text-muted">{message}</span>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, revenus: 0, depenses: 0 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        lightGray: '#f8f9fa',
        bgLight: '#f8f9fa',
        redLight: '#f8d7da',
        greenLight: '#d1e7dd',
        purpleLight: '#f3ccff',
        orangeLight: '#fff3cd',
        yellowLight: '#fff9db'
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/analyse/stats');
                const data = res.data;

                setStats(data.cards);
                setTransactions(data.recent);

                const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
                const labelsLine = Object.keys(data.chart.revenus).map(m => moisLabels[m]);
                
                setLineData({
                    labels: labelsLine,
                    datasets: [
                        {
                            label: 'Revenus',
                            data: Object.values(data.chart.revenus),
                            borderColor: colors.successGreen,
                            backgroundColor: 'rgba(25, 135, 84, 0.1)',
                            fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 12
                        },
                        {
                            label: 'Dépenses',
                            data: Object.values(data.chart.depenses),
                            borderColor: colors.red1,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 12
                        }
                    ]
                });

                const labelsCat = data.repartition.map(item => item.label);
                const valuesCat = data.repartition.map(item => item.total);

                setDoughnutData({
                    labels: labelsCat,
                    datasets: [{
                        data: valuesCat,
                        backgroundColor: [colors.darkGreen, colors.orange, colors.successGreen, colors.redLight, colors.greenLight, colors.purpleLight, colors.orangeLight, colors.yellowLight, colors.blue, colors.purple],
                        borderWidth: 0
                    }]
                });

                setBarData({
                    labels: labelsCat,
                    datasets: [{
                        label: 'Montant Total',
                        data: valuesCat,
                        backgroundColor: colors.orange,
                        borderRadius: 10,
                    }]
                });

                setPolarData({
                    labels: ['Revenus', 'Dépenses', 'Épargne'],
                    datasets: [{
                        data: [data.cards.revenus, data.cards.depenses, (data.cards.revenus - data.cards.depenses)],
                        backgroundColor: ['rgba(25, 135, 84, 0.7)', 'rgba(233, 114, 35, 0.7)', 'rgba(10, 59, 47, 0.7)'],
                    }]
                });

                setRadarData({
                    labels: ['Alimentation', 'Loyer', 'Loisirs', 'Santé', 'Transport'],
                    datasets: [{
                        label: 'Profil',
                        data: [80, 70, 50, 90, 60],
                        borderColor: colors.orange,
                        backgroundColor: 'rgba(233, 114, 35, 0.2)',
                    }]
                });

            } catch (err) {
                console.error("Erreur Dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
        }
    };

    return (
        <div className="container-fluid px-1 py-4 bg-light min-vh-100">
            {/* --- CARTES DE RÉSUMÉ --- */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 p-3 text-white h-100 position-relative" style={{ borderLeft: `10px solid ${colors.orange}`, backgroundColor: colors.darkGreen, borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold opacity-75">Solde Total</h6>
                                <h2 className="fw-bold mb-0">{stats.total.toLocaleString()} F</h2>
                            </div>
                            <i className="bi bi-bank2 fs-1 opacity-25"></i>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                    <div className="card shadow-sm border-0 p-3 bg-white h-100 position-relative" style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.successGreen}` }}>
                        {loading && <LoaderOverlay />}
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold text-muted">Total Revenus</h6>
                                <h3 className="fw-bold mb-0" style={{ color: colors.successGreen }}>+{stats.revenus.toLocaleString()}</h3>
                            </div>
                            <div className="rounded-circle p-2 bg-success-subtle"><i className="bi bi-arrow-up-right fs-4 text-success"></i></div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-md-4">
                    <div className="card shadow-sm border-0 p-3 bg-white h-100 position-relative" style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.orange}` }}>
                        {loading && <LoaderOverlay />}
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-uppercase small fw-bold text-muted">Total Dépenses</h6>
                                <h3 className="fw-bold mb-0" style={{ color: colors.orange }}>-{stats.depenses.toLocaleString()}</h3>
                            </div>
                            <div className="rounded-circle p-2 bg-warning-subtle"><i className="bi bi-arrow-down-left fs-4 text-warning"></i></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- GRAPHIQUES PRINCIPAUX --- */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-8">
                    <div className="card shadow-sm border-0 p-4 h-100 position-relative" style={{ borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <h5 className="fw-bold mb-4" style={{ color: colors.darkGreen }}><i className="bi bi-graph-up-arrow me-2"></i> Flux Mensuel</h5>
                        <div style={{ height: '250px' }}>
                            {!loading && <Line data={lineData} options={chartOptions} />}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-xl-4">
                    <div className="card shadow-sm border-0 p-4 h-100 position-relative" style={{ borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <h5 className="fw-bold mb-4" style={{ color: colors.darkGreen }}><i className="bi bi-pie-chart-fill me-2"></i> Par Catégorie</h5>
                        <div style={{ height: '250px' }}>
                            {!loading && <Doughnut data={doughnutData} options={chartOptions} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ANALYSE AVANCÉE --- */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 p-4 h-100 position-relative" style={{ borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <h6 className="fw-bold mb-3">Volume Comparatif</h6>
                        <div style={{ height: '200px' }}>
                            {!loading && <Bar data={barData} options={chartOptions} />}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 p-4 h-100 position-relative" style={{ borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <h6 className="fw-bold mb-3">Analyse des Flux</h6>
                        <div style={{ height: '200px' }}>
                            {!loading && <PolarArea data={polarData} options={chartOptions} />}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 p-4 h-100 position-relative" style={{ borderRadius: '15px' }}>
                        {loading && <LoaderOverlay />}
                        <h6 className="fw-bold mb-3">Équilibre</h6>
                        <div style={{ height: '200px' }}>
                            {!loading && <Radar data={radarData} options={chartOptions} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- TABLEAU --- */}
            <div className="card shadow-sm border-0 p-4 mb-5 position-relative" style={{ borderRadius: '15px' }}>
                {loading && <LoaderOverlay message="Chargement des activités..." />}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0" style={{ color: colors.darkGreen }}><i className="bi bi-clock-history me-2"></i> Activités Récentes</h5>
                    <button className="btn btn-sm text-white px-3" style={{ backgroundColor: colors.orange, borderRadius: '8px' }} onClick={() => navigate('/transactions')}>Tout voir</button>
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
                            {transactions.map((t, index) => (
                                <tr key={index}>
                                    <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                                    <td className="fw-medium">{t.description}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 ${t.type === 'revenu' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                            {t.type === 'revenu' ? 'Entrée' : 'Sortie'}
                                        </span>
                                    </td>
                                    <td className={`text-end fw-bold ${t.type === 'revenu' ? 'text-success' : 'text-danger'}`}>
                                        {t.type === 'revenu' ? '+' : '-'} {parseFloat(t.montant).toLocaleString()} F
                                    </td>
                                </tr>
                            ))}
                            {!loading && transactions.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">Aucune donnée récente</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;