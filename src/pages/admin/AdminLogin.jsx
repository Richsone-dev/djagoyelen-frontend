import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import adminApi from '../../api/adminAxios';
import logo from '../../assets/djago-logo.jpeg';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await adminApi.post('/admin/login', credentials);

            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));

            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Connexion refusée. Vérifiez vos identifiants administrateur.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-vh-100 d-flex align-items-center justify-content-center p-3"
            style={{ background: `linear-gradient(135deg, ${colors.darkGreen} 0%, #0d5c47 100%)` }}
        >
            <div
                className="card border-0 shadow-lg p-4 p-md-5"
                style={{ maxWidth: '440px', width: '100%', borderRadius: '16px' }}
            >
                <div className="text-center mb-4">
                    <img
                        src={logo}
                        alt="DjagoYelen"
                        style={{ width: 56, height: 56, marginBottom: 12 }}
                    />
                    <h4 className="fw-bold mb-1">
                        <i className="bi bi-shield-lock me-2" style={{ color: colors.orange }} />
                        Administration
                    </h4>
                    <p className="text-muted small mb-0">
                        Accès réservé aux administrateurs DjagoYelen
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small text-center">{error}</div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold">Email administrateur</label>
                        <input
                            type="email"
                            className="form-control"
                            value={credentials.email}
                            onChange={(e) =>
                                setCredentials((p) => ({ ...p, email: e.target.value }))
                            }
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold">Mot de passe</label>
                        <input
                            type="password"
                            className="form-control"
                            value={credentials.password}
                            onChange={(e) =>
                                setCredentials((p) => ({ ...p, password: e.target.value }))
                            }
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 text-white fw-bold"
                        style={{ backgroundColor: colors.orange, height: 48 }}
                    >
                        {loading ? 'Vérification...' : 'Connexion sécurisée'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link to="/login" className="small text-muted text-decoration-none">
                        <i className="bi bi-arrow-left me-1" />
                        Retour à l&apos;application utilisateur
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
