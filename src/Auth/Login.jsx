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
            navigate('/dashboard', { replace: true });
            setTimeout(() => { window.location.reload(); }, 100);
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
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
        // min-vh-100 garantit que la page prend toute la hauteur de l'écran
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" 
             style={{ backgroundColor: '#f8f9fa' }}>
            
            {/* La card s'adapte automatiquement : 100% sur mobile, max 450px sur PC */}
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
                    {/* Utilisation de text-start pour aligner les labels à gauche */}
                    <div className="mb-3 text-start">
                        <label className="form-label small fw-bold text-muted">Email</label>
                        <input name="email" type="email" className="form-control" placeholder="exemple@mail.com"
                               onChange={handleChange} required />
                    </div>

                    <div className="mb-3 text-start">
                        <label className="form-label small fw-bold text-muted">Mot de passe</label>
                        <input name="password" type="password" className="form-control" placeholder="*******"
                               onChange={handleChange} required />
                    </div>

                    <button type="submit" disabled={loading} 
                            className="btn w-100 text-white fw-bold mt-2"
                            style={{ backgroundColor: colors.orange, borderRadius: '10px', height: '50px' }}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

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