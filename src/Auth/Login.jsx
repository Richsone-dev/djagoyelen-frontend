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
            
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            
            // Plutôt qu'un navigate + setTimeout instable, on redirige proprement
            // et on force l'application globale à s'initialiser avec les nouvelles clés du localStorage.
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
        degradé: 'linear-gradient(135deg, #198754 0%, #E97223 100%)'
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3"
         
             style={{ backgroundColor: colors.degradé }}>
            
            <div className="card border-0 p-4 p-md-5 shadow-sm"
                 style={{ maxWidth: '450px', width: '100%', borderRadius: '15px' }}>
                
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginRight: '12px' }} />
                        <h2 className="fw-bold mb-0">
                            <span style={{ color: colors.successGreen }}>Djago</span>
                            <span style={{ color: colors.orange }}>Yelen</span>
                        </h2>
                    </div>
                    <p className="text-muted small">Connectez-vous à votre espace financier</p>
                </div>

                {error && (
                    <div className="alert alert-danger text-center small py-2">{error}</div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-3 text-start">
                        <label className="form-label small fw-bold text-muted">
                            <i className="fas fa-envelope me-1"></i> Email
                        </label>
                        <input 
                            name="email" 
                            type="email" 
                            className="form-control" 
                            placeholder="exemple@mail.com"
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="mb-3 text-start">
                        <label className="form-label small fw-bold text-muted">
                            <i className="fas fa-lock me-1"></i> Mot de passe
                        </label>
                        <input 
                            name="password" 
                            type="password" 
                            className="form-control" 
                            placeholder="**********"
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn w-100 text-white fw-bold mt-2"
                        style={{ backgroundColor: colors.orange, borderRadius: '10px', height: '50px' }}
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    {/* Structure HTML sémantique corrigée pour l'alerte de maintenance */}
                    <div className="alert alert-warning mt-4 py-2 text-center small rounded-3 border-1 border-warning">
                        <em className="text-muted small" style={{ fontSize: '0.82rem' }}> 
                            <i className="bi bi-exclamation-circle text-warning me-1"></i> 
                            Nous avons bloqué la création de compte pour l'instant, raison de maintenance. Merci !
                        </em>
                    </div>

                    <div className="text-center mt-3 small">
                        <span className="text-muted">Pas de compte ? </span>
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