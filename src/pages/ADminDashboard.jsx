import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const AdminDashboard = () => {
    // 1. Initialisation avec la nouvelle structure de données
    const [dashboardData, setDashboardData] = useState({
        stats: {
            total_users: 0,
            total_transactions: 0,
            users_registered_this_month: 0
        },
        monthly_growth: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/admin/dashboard');
                // On récupère tout l'objet envoyé par Laravel
                setDashboardData(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Erreur accès admin", error);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    const { stats } = dashboardData;

    return (
        <div className="container py-5">
            <h2 className="mb-4 fw-bold">Tableau de bord Administrateur</h2>
            
            <div className="row g-4">
                <StatCard title="Total PME" value={stats.total_users} icon="bi-people" color="primary" />
                <StatCard title="Total Transactions" value={stats.total_transactions} icon="bi-cash-stack" color="success" />
                <StatCard title="Nouveaux ce mois" value={stats.users_registered_this_month} icon="bi-person-plus" color="warning" />
            </div>

            {/* Ici vous pourrez insérer votre composant Recharts plus tard */}
            <div className="mt-5">
                <h4>Évolution des inscriptions (Derniers mois)</h4>
                <pre>{JSON.stringify(dashboardData.monthly_growth, null, 2)}</pre> 
                {/* Cette ligne affiche vos données brutes pour vérifier la connexion */}
            </div>
        </div>
    );
};

// Le composant StatCard reste identique
const StatCard = ({ title, value, icon, color }) => (
    <div className="col-md-4">
        <div className={`card text-white bg-${color} mb-3 shadow`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="card-title text-uppercase">{title}</h6>
                        <h2 className="fw-bold">{value}</h2>
                    </div>
                    <i className={`bi ${icon} fs-1 opacity-50`}></i>
                </div>
            </div>
        </div>
    </div>
);

export default AdminDashboard;