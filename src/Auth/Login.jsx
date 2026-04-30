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

            // Stockage
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // ✅ IMPORTANT : navigation React (PAS window.location)
            navigate('/dashboard');

        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Email ou mot de passe incorrect.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        yellow: '#F4B41A',
        successGreen: '#198754'
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-4" 
             style={{ backgroundColor: '#f8f9fa' }}>
            
            <div className="card border-0 p-3 p-md-5 mx-2" 
                 style={{ 
                     maxWidth: '450px', 
                     width: '100%', 
                     borderRadius: '15px',
                     backgroundColor: '#ffffff' 
                 }}>
                
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <img 
                            src={logo} 
                            alt="Logo DjagoYelen" 
                            style={{ width: '50px', height: '50px', objectFit: 'contain', marginRight: '12px' }} 
                        />
                        <h2 className="fw-bold mb-0" style={{ fontSize: '1.4rem' }}>
                            <span style={{ color: colors.successGreen }}>Djago</span>
                            <span style={{ color: colors.orange }}>Yelen</span>        
                        </h2>
                    </div>
                    <p className="text-muted small">Connectez-vous à votre espace financier</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small border-0 text-center mb-4" 
                         style={{ backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '10px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Adresse Email</label>
                        <input 
                            name="email" 
                            type="email" 
                            className="form-control form-control-lg fs-6" 
                            placeholder="exemple@mail.com"
                            onChange={handleChange} 
                            style={{ borderRadius: '10px', border: '1px solid #dee2e6', padding: '12px' }}
                            required 
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Mot de passe</label>
                        <input 
                            name="password" 
                            type="password" 
                            className="form-control form-control-lg fs-6" 
                            placeholder="••••••••"
                            onChange={handleChange} 
                            style={{ borderRadius: '10px', border: '1px solid #dee2e6', padding: '12px' }}
                            required 
                        />
                        <div className="text-end mt-2">
                            <Link to="/forgot-password" className="fw-bold text-decoration-none small" style={{ color: colors.successGreen }}>
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn btn-lg w-100 mt-2 mb-3 text-white fw-bold d-flex align-items-center justify-content-center" 
                        style={{ 
                            backgroundColor: colors.orange, 
                            border: 'none', 
                            borderRadius: '10px',
                            height: '52px',
                            opacity: loading ? 0.8 : 1
                        }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Connexion...
                            </>
                        ) : (
                            "Se connecter"
                        )}
                    </button>

                    <div className="text-center mt-3 small">
                        <span className="text-muted">Vous n'avez pas de compte ?</span>{' '}
                        <Link to="/register" className="fw-bold text-decoration-none" style={{ color: colors.successGreen }}>
                            Créer un compte
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;