import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useTheme } from '../context/ThemeContext'; 

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

/* --- COMPOSANT SKELETON POUR LES GRAPHIQUES --- */
const ChartSkeleton = ({ title }) => (
    <div className="w-100 placeholder-glow d-flex flex-column justify-content-between" style={{ height: '250px' }}>
        <h5 className="placeholder col-5 bg-secondary rounded mb-4" style={{ height: '20px' }}></h5>
        <div className="d-flex align-items-end justify-content-around w-100 flex-grow-1 px-2 pb-3">
            <div className="placeholder bg-secondary rounded-top" style={{ height: '40%', width: '12%' }}></div>
            <div className="placeholder bg-secondary rounded-top" style={{ height: '75%', width: '12%' }}></div>
            <div className="placeholder bg-secondary rounded-top" style={{ height: '55%', width: '12%' }}></div>
            <div className="placeholder bg-secondary rounded-top" style={{ height: '90%', width: '12%' }}></div>
        </div>
        <div className="d-flex justify-content-center gap-3">
            <span className="placeholder col-2 bg-secondary rounded" style={{ height: '12px' }}></span>
            <span className="placeholder col-2 bg-secondary rounded" style={{ height: '12px' }}></span>
        </div>
    </div>
);

const Dashboard = () => {
    const { theme } = useTheme(); 
    const isDark = theme === 'dark';

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
        darkGreen: isDark ? '#198754' : '#0A3B2F',
        red1: '#FF0000',
        orange: '#E97223',
        successGreen: '#198754',
        blue: '#2196f3',
        purple: '#9c27b0',
        chartColors: [
            '#0A3B2F', '#E97223', '#198754', '#f8d7da', 
            '#d1e7dd', '#f3ccff', '#fff3cd', '#fff9db', '#2196f3', '#9c27b0'
        ]
    };

    const textChartColor = isDark ? '#f8f9fa' : '#212529';
    const gridChartColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';

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
                        backgroundColor: colors.chartColors,
                        borderWidth: isDark ? 1 : 0,
                        borderColor: isDark ? '#2b3035' : 'transparent'
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
                        borderColor: isDark ? '#2b3035' : '#fff'
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
    }, [isDark]);

    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: { 
                position: 'bottom', 
                labels: { boxWidth: 10, font: { size: 10 }, color: textChartColor } 
            }
        },
        scales: {
            x: { grid: { color: gridChartColor }, ticks: { color: textChartColor } },
            y: { grid: { color: gridChartColor }, ticks: { color: textChartColor } },
            r: { 
                grid: { color: gridChartColor },
                angleLines: { color: gridChartColor },
                pointLabels: { color: textChartColor },
                ticks: { backdropColor: 'transparent', color: textChartColor }
            }
        }
    };

    return (
        <div className={`container-fluid px-1 py-4 min-vh-100 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            
            {/* --- SYSTEM DE SKELETONS POUR LES CARTES --- */}
            <div className="row g-3 mb-4">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="col-12 col-sm-6 col-md-4 placeholder-glow">
                            <div className={`card shadow-sm border-0 p-3 h-100 ${isDark ? 'bg-secondary bg-opacity-10' : 'bg-white'}`} style={{ borderRadius: '15px' }}>
                                <span className="placeholder col-4 bg-secondary rounded mb-3" style={{ height: '14px' }}></span>
                                <span className="placeholder col-8 bg-secondary rounded" style={{ height: '32px' }}></span>
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        <div className="col-12 col-md-4">
                            <div className="card shadow-sm border-0 p-3 text-white h-100" style={{ borderLeft: `10px solid ${colors.orange}`, backgroundColor: isDark ? '#0b2e24' : colors.darkGreen, borderRadius: '15px' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="text-uppercase small fw-bold opacity-75">Solde Total</h6>
                                        <h2 className="fw-bold mb-0">{stats.total.toLocaleString()} F CFA</h2>
                                    </div>
                                    <i className="bi bi-bank2 fs-1 opacity-25"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4">
                            <div className={`card shadow-sm border-0 p-3 h-100 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.successGreen}` }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className={`text-uppercase small fw-bold ${isDark ? 'text-light opacity-75' : 'text-muted'}`}>Total Revenus</h6>
                                        <h3 className="fw-bold mb-0" style={{ color: colors.successGreen }}>+{stats.revenus.toLocaleString()} F CFA</h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-success bg-opacity-25"><i className="bi bi-arrow-up-right fs-4 text-success"></i></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4">
                            <div className={`card shadow-sm border-0 p-3 h-100 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px', borderLeft: `5px solid ${colors.orange}` }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className={`text-uppercase small fw-bold ${isDark ? 'text-light opacity-75' : 'text-muted'}`}>Total Dépenses</h6>
                                        <h3 className="fw-bold mb-0" style={{ color: colors.orange }}>-{stats.depenses.toLocaleString()} F CFA</h3>
                                    </div>
                                    <div className="rounded-circle p-2 bg-warning bg-opacity-25"><i className="bi bi-arrow-down-left fs-4 text-warning"></i></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* --- GRAPHIQUES PRINCIPAUX --- */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-8">
                    <div className={`card shadow-sm border-0 p-4 h-100 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px' }}>
                        {loading ? <ChartSkeleton /> : (
                            <>
                                <h5 className="fw-bold mb-4" style={{ color: isDark ? '#4ade80' : colors.darkGreen }}><i className="bi bi-graph-up-arrow me-2"></i> Flux Mensuel</h5>
                                <div style={{ height: '250px' }}>
                                    <Line data={lineData} options={chartOptions} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="col-12 col-xl-4">
                    <div className={`card shadow-sm border-0 p-4 h-100 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px' }}>
                        {loading ? <ChartSkeleton /> : (
                            <>
                                <h5 className="fw-bold mb-4" style={{ color: isDark ? '#4ade80' : colors.darkGreen }}><i className="bi bi-pie-chart-fill me-2"></i> Par Catégorie</h5>
                                <div style={{ height: '250px' }}>
                                    <Doughnut data={doughnutData} options={chartOptions} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- ANALYSE AVANCÉE --- */}
            <div className="row g-4 mb-4">
                {[
                    { title: "Volume Comparatif", component: <Bar data={barData} options={chartOptions} /> },
                    { title: "Analyse des Flux", component: <PolarArea data={polarData} options={chartOptions} /> },
                    { title: "Équilibre", component: <Radar data={radarData} options={chartOptions} /> }
                ].map((graph, idx) => (
                    <div key={idx} className="col-12 col-md-4">
                        <div className={`card shadow-sm border-0 p-4 h-100 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px' }}>
                            {loading ? <ChartSkeleton /> : (
                                <>
                                    <h6 className="fw-bold mb-3">{graph.title}</h6>
                                    <div style={{ height: '200px' }}>
                                        {graph.component}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* --- TABLEAU DES ACTIVITÉS RÉCENTES --- */}
            <div className={`card shadow-sm border-0 p-4 mb-5 ${isDark ? 'bg-secondary bg-opacity-10 text-white' : 'bg-white'}`} style={{ borderRadius: '15px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold m-0" style={{ color: isDark ? '#4ade80' : colors.darkGreen }}><i className="bi bi-clock-history me-2"></i> Activités Récentes</h5>
                    {!loading && <button className="btn btn-sm text-white px-3" style={{ backgroundColor: colors.orange, borderRadius: '8px' }} onClick={() => navigate('/transactions')}>Tout voir</button>}
                </div>
                <div className="table-responsive">
                    <table className={`table table-hover align-middle ${isDark ? 'table-dark' : ''}`}>
                        <thead className={isDark ? 'table-secondary' : 'table-light'}>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th className="text-end">Montant</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? "placeholder-glow" : ""}>
                            {loading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={`t-sk-${i}`}>
                                        <td><span className="placeholder col-6 bg-secondary rounded" style={{ height: '15px' }}></span></td>
                                        <td><span className="placeholder col-10 bg-secondary rounded" style={{ height: '15px' }}></span></td>
                                        <td><span className="placeholder col-4 bg-secondary rounded" style={{ height: '20px' }}></span></td>
                                        <td className="text-end"><span className="placeholder col-5 bg-secondary rounded" style={{ height: '15px' }}></span></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className={`text-center py-4 ${isDark ? 'text-light opacity-50' : 'text-muted'}`}>
                                        Aucune donnée récente
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t, index) => (
                                    <tr key={index}>
                                        <td>{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="fw-medium">{t.description}</td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${
                                                t.type === 'revenu' 
                                                    ? (isDark ? 'bg-success text-light bg-opacity-50' : 'bg-success-subtle text-success') 
                                                    : (isDark ? 'bg-danger text-light bg-opacity-50' : 'bg-danger-subtle text-danger')
                                            }`}>
                                                {t.type === 'revenu' ? 'Entrée' : 'Sortie'}
                                            </span>
                                        </td>
                                        <td className={`text-end fw-bold ${t.type === 'revenu' ? 'text-success' : 'text-danger'}`}>
                                            {t.type === 'revenu' ? '+' : '-'} {parseFloat(t.montant).toLocaleString()} F
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;