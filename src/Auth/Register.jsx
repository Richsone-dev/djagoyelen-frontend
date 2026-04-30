import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg'; 

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirmation) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);
        try {
            await api.post('/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" 
             style={{ backgroundColor: '#f8f9fa' }}>
            
            <div className="card shadow-sm border-0 p-4 p-md-5" 
                 style={{ maxWidth: '600px', width: '100%', borderRadius: '20px' }}>
                
                {/* En-tête */}
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" style={{ width: '70px', height: '70px', borderRadius: '15px', objectFit: 'cover' }} />
                    <h2 className="fw-bold mt-3 mb-1">Créez votre compte</h2>
                    <p className="text-muted small">Créez votre compte pour commencer</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 text-center small rounded-3">{error}</div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="row" style={{textAlign: 'left'}}>
                        {/* Nom */}
                        <div className="col-12 mb-3">
                            <label className="form-label fw-bold text-muted small ps-1">Nom complet</label>
                            <input name="name" type="text" className="form-control form-control-lg" 
                                   placeholder="Jean Dupont" onChange={handleChange} required 
                                   style={{ borderRadius: '12px' }} />
                        </div>
                        {/* Email */}
                        <div className="col-12 mb-3">
                            <label className="form-label fw-bold text-muted small ps-1">Adresse Email</label>
                            <input name="email" type="email" className="form-control form-control-lg" 
                                   placeholder="exemple@mail.com" onChange={handleChange} required 
                                   style={{ borderRadius: '12px' }} />
                        </div>
                        {/* Mot de passe */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-bold text-muted small ps-1">Mot de passe</label>
                            <input name="password" type="password" className="form-control form-control-lg" 
                                   placeholder="**********" onChange={handleChange} required 
                                   style={{ borderRadius: '12px' }} />
                        </div>
                        {/* Confirmation */}
                        <div className="col-12 col-md-6 mb-4">
                            <label className="form-label fw-bold text-muted small ps-1">Confirmation</label>
                            <input name="password_confirmation" type="password" className="form-control form-control-lg" 
                                   placeholder="**********" onChange={handleChange} required 
                                   style={{ borderRadius: '12px' }} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} 
                            className="btn btn-lg w-100 text-white fw-bold shadow-sm"
                            style={{ backgroundColor: '#198754', borderRadius: '12px', height: '55px' }}>
                        {loading ? 'Inscription en cours...' : "S'inscrire"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted small">Vous avez déjà un compte ? </span>
                    <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#E97223' }}>
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;