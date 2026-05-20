import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminAxios';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await adminApi.get('/admin/dashboard');
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-success" role="status" />
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    const stats = data?.stats || {};

    const cards = [
        { title: 'Utilisateurs', value: stats.total_users, icon: 'people', color: 'primary' },
        { title: 'Transactions', value: stats.total_transactions, icon: 'cash-stack', color: 'success' },
        { title: 'Clients', value: stats.total_clients, icon: 'person-lines-fill', color: 'info' },
        { title: 'Factures', value: stats.total_factures, icon: 'receipt', color: 'warning' },
        { title: 'Nouveaux ce mois', value: stats.users_registered_this_month, icon: 'person-plus', color: 'secondary' },
        { title: 'Administrateurs', value: stats.admins_count, icon: 'shield-check', color: 'danger' },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Tableau de bord</h2>
                    <p className="text-muted mb-0">Vue d&apos;ensemble de la plateforme DjagoYelen</p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <Link to="/admin/users" className="btn btn-success">
                        <i className="bi bi-people me-1" />
                        Utilisateurs
                    </Link>
                    <Link
                        to="/admin/users"
                        state={{ openCreateAdmin: true }}
                        className="btn btn-danger"
                    >
                        <i className="bi bi-shield-lock me-1" />
                        Nouvel admin
                    </Link>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {cards.map((card) => (
                    <div key={card.title} className="col-md-6 col-xl-4">
                        <div className={`card border-0 shadow-sm h-100`}>
                            <div className="card-body d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted small mb-1">{card.title}</p>
                                    <h3 className="fw-bold mb-0">{card.value ?? 0}</h3>
                                </div>
                                <div
                                    className={`rounded-circle bg-${card.color} bg-opacity-10 p-3`}
                                >
                                    <i className={`bi bi-${card.icon} text-${card.color} fs-4`} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white fw-bold">
                    Inscriptions (6 derniers mois)
                </div>
                <div className="card-body">
                    {data?.monthly_growth?.length ? (
                        <div className="table-responsive">
                            <table className="table table-sm mb-0">
                                <thead>
                                    <tr>
                                        <th>Mois</th>
                                        <th>Nouveaux utilisateurs</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.monthly_growth.map((row) => (
                                        <tr key={row.month}>
                                            <td>{row.month}</td>
                                            <td>
                                                <span className="badge bg-success">{row.count}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">Aucune donnée disponible.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
