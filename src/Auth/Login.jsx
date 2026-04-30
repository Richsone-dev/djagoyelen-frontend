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
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            
            navigate('/dashboard', { replace: true });
            setTimeout(() => window.location.reload(), 100);
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
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" 
             style={{ backgroundColor: '#f0f2f5' }}>
            
            <div className="card border-0 shadow-lg p-4 p-md-5" 
                 style={{ maxWidth: '420px', width: '100%', borderRadius: '20px' }}>
                
                {/* Header Section */}
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="mb-3" 
                         style={{ width: '60px', height: '60px', borderRadius: '15px', objectFit: 'cover' }} />
                    <h2 className="fw-bold mb-1">
                        <span style={{ color: colors.successGreen }}>Djago</span>
                        <span style={{ color: colors.orange }}>Yelen</span>
                    </h2>
                    <p className="text-muted">Connectez-vous à votre espace</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger py-2 text-center small rounded-pill">
                        {error}
                    </div>
                )}

                {/* Form Section */}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-muted ms-1">Email</label>
                        <input name="email" type="email" className="form-control form-control-lg" 
                               placeholder="exemple@mail.com" onChange={handleChange} required
                               style={{ borderRadius: '12px', fontSize: '1rem' }} />
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-bold small text-muted ms-1">Mot de passe</label>
                        <input name="password" type="password" className="form-control form-control-lg" 
                               placeholder="••••••••" onChange={handleChange} required
                               style={{ borderRadius: '12px', fontSize: '1rem' }} />
                    </div>

                    <button type="submit" disabled={loading} 
                            className="btn btn-lg w-100 text-white fw-bold shadow-sm"
                            style={{ backgroundColor: colors.orange, borderRadius: '12px', transition: '0.3s' }}>
                        {loading ? 'Chargement...' : 'Se connecter'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted small">Pas de compte ? </span>
                    <Link to="/register" className="fw-bold text-decoration-none" 
                          style={{ color: colors.successGreen }}>Créer un compte</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;