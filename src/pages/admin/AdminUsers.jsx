import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import adminApi from '../../api/adminAxios';
import Swal from 'sweetalert2';

const emptyForm = {
    name: '',
    email: '',
    telephone: '',
    password: '',
    role: 'user',
};

const AdminUsers = () => {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [createMode, setCreateMode] = useState('user');

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/users', {
                params: { page, search: search || undefined },
            });
            const payload = res.data.users;
            setUsers(payload.data || []);
            setPagination({
                current_page: payload.current_page,
                last_page: payload.last_page,
                total: payload.total,
            });
        } catch (err) {
            Swal.fire('Erreur', err.response?.data?.message || 'Chargement impossible', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (location.state?.openCreateAdmin) {
            openCreate('admin');
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const openCreate = (mode = 'user') => {
        setIsEditing(false);
        setEditId(null);
        setCreateMode(mode);
        setForm({
            ...emptyForm,
            role: mode === 'admin' ? 'admin' : 'user',
        });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (user) => {
        setIsEditing(true);
        setEditId(user.id);
        setForm({
            name: user.name || '',
            email: user.email || '',
            telephone: user.telephone || '',
            password: '',
            role: user.role || 'user',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            if (isEditing) {
                const payload = { ...form };
                if (!payload.password) delete payload.password;
                await adminApi.put(`/admin/users/${editId}`, payload);
                Swal.fire('Succès', 'Utilisateur mis à jour', 'success');
            } else {
                await adminApi.post('/admin/users', form);
                Swal.fire(
                    'Succès',
                    form.role === 'admin'
                        ? 'Administrateur créé avec succès'
                        : 'Utilisateur créé avec succès',
                    'success'
                );
            }
            setShowModal(false);
            fetchUsers(pagination?.current_page || 1);
        } catch (err) {
            if (err.response?.status === 422) {
                const flat = {};
                Object.entries(err.response.data.errors || {}).forEach(([k, v]) => {
                    flat[k] = Array.isArray(v) ? v[0] : v;
                });
                setErrors(flat);
            } else {
                Swal.fire('Erreur', err.response?.data?.message || 'Opération échouée', 'error');
            }
        }
    };

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            title: 'Supprimer cet utilisateur ?',
            text: `${user.name} (${user.email}) — données associées supprimées.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        try {
            await adminApi.delete(`/admin/users/${user.id}`);
            Swal.fire('Supprimé', 'Utilisateur supprimé', 'success');
            fetchUsers(pagination?.current_page || 1);
        } catch (err) {
            Swal.fire('Erreur', err.response?.data?.message || 'Suppression impossible', 'error');
        }
    };

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Utilisateurs</h2>
                    <p className="text-muted mb-0">
                        {pagination?.total ?? 0} compte(s) enregistré(s)
                    </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    <button type="button" className="btn btn-success" onClick={() => openCreate('user')}>
                        <i className="bi bi-person-plus me-1" />
                        Nouvel utilisateur
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => openCreate('admin')}
                    >
                        <i className="bi bi-shield-lock me-1" />
                        Nouvel administrateur
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                    <form
                        className="row g-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchUsers(1);
                        }}
                    >
                        <div className="col-md-8">
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Rechercher par nom, email ou téléphone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 d-flex gap-2">
                            <button type="submit" className="btn btn-outline-success flex-grow-1">
                                Rechercher
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    setSearch('');
                                    setTimeout(() => fetchUsers(1), 0);
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Rôle</th>
                                <th>Données</th>
                                <th>Inscrit le</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        <div className="spinner-border spinner-border-sm text-success" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td className="fw-semibold">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.telephone || '—'}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    user.role === 'admin'
                                                        ? 'bg-danger'
                                                        : 'bg-secondary'
                                                }`}
                                            >
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="small text-muted">
                                            {user.transactions_count ?? 0} trans. ·{' '}
                                            {user.clients_count ?? 0} clients ·{' '}
                                            {user.factures_count ?? 0} fact.
                                        </td>
                                        <td className="small">
                                            {user.created_at
                                                ? new Date(user.created_at).toLocaleDateString('fr-FR')
                                                : '—'}
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <Link
                                                    to={`/admin/users/${user.id}`}
                                                    className="btn btn-outline-primary"
                                                    title="Détails"
                                                >
                                                    <i className="bi bi-eye" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-warning"
                                                    onClick={() => openEdit(user)}
                                                    title="Modifier"
                                                >
                                                    <i className="bi bi-pencil" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(user)}
                                                    title="Supprimer"
                                                >
                                                    <i className="bi bi-trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.last_page > 1 && (
                    <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            Page {pagination.current_page} / {pagination.last_page}
                        </small>
                        <div className="btn-group btn-group-sm">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={pagination.current_page <= 1}
                                onClick={() => fetchUsers(pagination.current_page - 1)}
                            >
                                Précédent
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => fetchUsers(pagination.current_page + 1)}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div
                    className="modal show d-block"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {isEditing
                                            ? 'Modifier utilisateur'
                                            : createMode === 'admin'
                                            ? 'Nouvel administrateur'
                                            : 'Nouvel utilisateur'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-2">
                                        <label className="form-label">Nom *</label>
                                        <input
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, name: e.target.value }))
                                            }
                                            required
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, email: e.target.value }))
                                            }
                                            required
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Téléphone</label>
                                        <input
                                            className="form-control"
                                            value={form.telephone}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    telephone: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">
                                            Mot de passe {isEditing ? '(laisser vide = inchangé)' : '*'}
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    password: e.target.value,
                                                }))
                                            }
                                            required={!isEditing}
                                            minLength={isEditing ? 0 : 8}
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback">{errors.password}</div>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label">Rôle *</label>
                                        <select
                                            className="form-select"
                                            value={form.role}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, role: e.target.value }))
                                            }
                                            disabled={!isEditing && createMode === 'admin'}
                                        >
                                            <option value="user">Utilisateur</option>
                                            <option value="admin">Administrateur</option>
                                        </select>
                                        {!isEditing && createMode === 'admin' && (
                                            <small className="text-muted">
                                                Ce compte aura accès à l&apos;espace admin (
                                                <code>#/admin/login</code>).
                                            </small>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        {isEditing ? 'Enregistrer' : 'Créer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
