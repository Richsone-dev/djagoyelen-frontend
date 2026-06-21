import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // État pour afficher/masquer le MDP
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
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            navigate('/dashboard', { replace: true });
            setTimeout(() => { window.location.reload(); }, 100);
        } catch (err) {
            setError(err.response?.data?.message || 'Veuillez verifier votre connexion ou vos info puis rééssayez !');
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
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" 
             //style={{ backgroundColor: 'rgba(10, 59, 47, 0.03)' }}
             > {/* Légère touche de darkGreen en fond */}
            
            <div className="card border-0 p-4 p-md-5 shadow"
                 style={{ maxWidth: '440px', width: '100%', borderRadius: '20px' }}>
                
                {/* Header / Logo */}
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <img 
                            src={logo} 
                            alt="Logo" 
                            className="rounded-circle border p-1"
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderColor: '#eee' }} 
                        />
                        <h2 className="fw-bold mb-0 tracking-tight">
                            <span style={{ color: colors.successGreen }}>Djago</span>
                            <span style={{ color: colors.orange }}>Yelen</span>
                        </h2>
                    </div>
                    <p className="text-muted small">Connectez-vous à votre espace financier</p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 border-danger text-start small py-2.5 px-3 rounded-3 mb-4">
                        <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                        <div>{error}</div>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleLogin}>
                    {/* Input Email */}
                    <div className="mb-3 text-start">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                            <i className="bi bi-envelope me-1.5"></i> Email
                        </label>
                        <input 
                            name="email" 
                            type="email" 
                            className="form-control form-control-lg shadow-none" 
                            placeholder="exemple@mail.com"
                            style={{ 
                                fontSize: '15px', 
                                borderRadius: '10px',
                                border: '1.5px solid #dee2e6'
                            }}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    {/* Input Mot de passe avec bouton oeil */}
                    <div className="mb-4 text-start">
                        <label className="form-label small fw-semibold text-secondary mb-1">
                            <i className="bi bi-lock me-1.5"></i> Mot de passe
                        </label>
                        <div className="input-group">
                            <input 
                                name="password" 
                                type={showPassword ? 'text' : 'password'} 
                                className="form-control form-control-lg shadow-none" 
                                placeholder="**********"
                                style={{ 
                                    fontSize: '15px', 
                                    borderTopLeftRadius: '10px',
                                    borderBottomLeftRadius: '10px',
                                    border: '1.5px solid #dee2e6',
                                    borderRight: 'none'
                                }}
                                onChange={handleChange} 
                                required 
                            />
                            <button
                                type="button"
                                className="btn btn-outline-secondary d-flex align-items-center bg-white px-3"
                                style={{ 
                                    borderTopRightRadius: '10px',
                                    borderBottomRightRadius: '10px',
                                    border: '1.5px solid #dee2e6',
                                    borderLeft: 'none',
                                    color: '#6c757d'
                                }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Bouton de Soumission */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn login-btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all"
                        style={{ 
                            backgroundColor: colors.orange, 
                            borderRadius: '10px', 
                            height: '48px',
                            border: 'none'
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                <span>Connexion en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Se connecter</span>
                                <i className="bi bi-arrow-right small"></i>
                            </>
                        )}
                    </button>

                    {/* Lien d'inscription */}
                    <div className="text-center mt-4 small">
                        <span className="text-muted">Pas de compte ? </span>
                        <Link to="/register" className="fw-bold text-decoration-none transition-all" style={{ color: colors.successGreen }}>
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;