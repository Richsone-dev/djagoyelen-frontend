import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/login', credentials);

            // 🔐 stockage
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // ✅ navigation + refresh (solution adaptée à ton App actuel)
            navigate('/dashboard', { replace: true });

            // ⚠️ force React à relire localStorage
            setTimeout(() => {
                window.location.reload();
            }, 100);

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                'Email ou mot de passe incorrect.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754'
    };

    return (
        <div
            className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-4"
            style={{ backgroundColor: '#f8f9fa' }}
        >
            <div
                className="card border-0 p-3 p-md-5 mx-2"
                style={{
                    maxWidth: '450px',
                    width: '100%',
                    borderRadius: '15px',
                    backgroundColor: '#ffffff'
                }}
            >
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <img
                            src={logo}
                            alt="Logo"
                            style={{
                                width: '50px',
                                height: '50px',
                                marginRight: '12px'
                            }}
                        />
                        <h2 className="fw-bold mb-0">
                            <span style={{ color: colors.successGreen }}>
                                Djago
                            </span>
                            <span style={{ color: colors.orange }}>
                                Yelen
                            </span>
                        </h2>
                    </div>
                    <p className="text-muted small">
                        Connectez-vous à votre espace financier
                    </p>
                </div>

                {error && (
                    <div className="alert alert-danger text-center small">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            className="form-control"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">
                            Mot de passe
                        </label>
                        <input
                            name="password"
                            type="password"
                            className="form-control"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 text-white fw-bold"
                        style={{
                            backgroundColor: colors.orange,
                            borderRadius: '10px',
                            height: '50px'
                        }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div className="text-center mt-3 small">
                        <span className="text-muted">
                            Pas de compte ?
                        </span>{' '}
                        <Link
                            to="/register"
                            className="fw-bold text-decoration-none"
                            style={{ color: colors.successGreen }}
                        >
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;