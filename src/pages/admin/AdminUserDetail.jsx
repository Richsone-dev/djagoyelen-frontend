import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import adminApi from '../../api/adminAxios';

const AdminUserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await adminApi.get(`/admin/users/${id}`);
                setUser(res.data.user);
            } catch (err) {
                setError(err.response?.data?.message || 'Utilisateur introuvable');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-success" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div>
                <div className="alert alert-danger">{error}</div>
                <Link to="/admin/users" className="btn btn-outline-secondary">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    const counts = [
        { label: 'Transactions', value: user.transactions_count },
        { label: 'Clients', value: user.clients_count },
        { label: 'Factures', value: user.factures_count },
        { label: 'Budgets', value: user.budgets_count },
        { label: 'Catégories', value: user.categories_count },
    ];

    const DataTable = ({ title, rows, columns }) => (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white fw-bold">{title}</div>
            <div className="card-body p-0">
                {rows?.length ? (
                    <div className="table-responsive">
                        <table className="table table-sm mb-0">
                            <thead className="table-light">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        {columns.map((col) => (
                                            <td key={col.key}>
                                                {col.render ? col.render(row) : row[col.key] ?? '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted small p-3 mb-0">Aucune donnée</p>
                )}
            </div>
        </div>
    );

    return (
        <div>
            <Link to="/admin/users" className="btn btn-outline-secondary btn-sm mb-3">
                <i className="bi bi-arrow-left me-1" />
                Retour
            </Link>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                        <div>
                            <h2 className="fw-bold mb-1">{user.name}</h2>
                            <p className="text-muted mb-1">{user.email}</p>
                            <p className="mb-2">
                                <i className="bi bi-telephone me-1" />
                                {user.telephone || '—'}
                            </p>
                            <span
                                className={`badge ${
                                    user.role === 'admin' ? 'bg-danger' : 'bg-secondary'
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                        <div className="text-end small text-muted">
                            <div>ID : {user.id}</div>
                            <div>
                                Inscrit le{' '}
                                {user.created_at
                                    ? new Date(user.created_at).toLocaleString('fr-FR')
                                    : '—'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-2 mb-4">
                {counts.map((c) => (
                    <div key={c.label} className="col-6 col-md-4 col-lg">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="fw-bold fs-4 text-success">{c.value ?? 0}</div>
                                <small className="text-muted">{c.label}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <DataTable
                title="Dernières transactions"
                rows={user.transactions}
                columns={[
                    { key: 'id', label: '#' },
                    { key: 'type', label: 'Type' },
                    { key: 'montant', label: 'Montant', render: (r) => `${r.montant} F` },
                    { key: 'date', label: 'Date' },
                ]}
            />

            <DataTable
                title="Clients"
                rows={user.clients}
                columns={[
                    { key: 'nom', label: 'Nom' },
                    { key: 'email', label: 'Email' },
                    { key: 'telephone', label: 'Téléphone' },
                ]}
            />

            <DataTable
                title="Factures récentes"
                rows={user.factures}
                columns={[
                    { key: 'numero_facture', label: 'N°' },
                    {
                        key: 'client',
                        label: 'Client',
                        render: (r) => r.client?.nom || '—',
                    },
                    { key: 'total_ttc', label: 'TTC', render: (r) => `${r.total_ttc} F` },
                    { key: 'statut', label: 'Statut' },
                ]}
            />

            <DataTable
                title="Budgets"
                rows={user.budgets}
                columns={[
                    { key: 'id', label: '#' },
                    { key: 'amount_limit', label: 'Limite', render: (r) => `${r.amount_limit ?? 0} F` },
                    { key: 'period', label: 'Période' },
                ]}
            />
        </div>
    );
};

export default AdminUserDetail;
