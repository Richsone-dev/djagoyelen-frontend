import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg'; 

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // CORRIGÉ : Déclaration de l'état loading
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validation locale simple avant l'envoi
        if (formData.password !== formData.password_confirmation) {
            return setError("Les mots de passe ne correspondent pas.");
        }

        setLoading(true); // Active le spinner
        try {
            await api.post('/register', formData);
            
            // Utilisation de navigate au lieu de window.location pour une meilleure fluidité SPA
            setTimeout(() => {
                navigate('/login');
            }, 500);
        } catch (err) {
            // Récupération des messages d'erreur de Laravel (souvent dans err.response.data.errors)
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription.';
            setError(errorMessage);
            setLoading(false); // Désactive le spinner en cas d'échec
        }
    };

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        yellow: '#F4B41A',
        successGreen: '#198754'
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5" 
             style={{ backgroundColor: '#f8f9fa' }}>
            
            <div className="card shadow border-0 p-4 p-md-5 mx-3" 
                 style={{ maxWidth: '700px', width: '100%', borderRadius: '15px' }}>
                
                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <img 
                            src={logo} 
                            alt="Logo DjagoYelen" 
                            style={{ width: '60px', height: '60px', objectFit: 'contain', marginRight: '15px' }} 
                        />
                        <h2 className="fw-bold mb-0" style={{ fontSize: '2.2rem' }}>
                            <span style={{ color: colors.successGreen }}>Djago</span>
                            <span style={{ color: colors.orange }}>Yelen</span>
                        </h2>
                    </div>
                    <p className="text-muted small">Créez votre compte en quelques secondes</p>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small border-0 text-center" 
                         style={{ backgroundColor: '#fff5f5', color: '#c53030', borderRadius: '10px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="row">
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Nom complet</label>
                            <input 
                                name="name" 
                                type="text" 
                                className="form-control form-control-lg fs-6" 
                                placeholder="Alex Millogo"
                                onChange={handleChange} 
                                style={{ borderRadius: '10px' }}
                                required 
                            />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Adresse Email</label>
                            <input 
                                name="email" 
                                type="email" 
                                className="form-control form-control-lg fs-6" 
                                placeholder="nom@exemple.com"
                                onChange={handleChange} 
                                style={{ borderRadius: '10px' }}
                                required 
                            />
                        </div>

                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label small fw-bold text-muted">Mot de passe</label>
                            <input 
                                name="password" 
                                type="password" 
                                className="form-control form-control-lg fs-6" 
                                placeholder="••••••••"
                                onChange={handleChange} 
                                style={{ borderRadius: '10px' }}
                                required 
                            />
                        </div>

                        <div className="col-12 col-md-6 mb-4">
                            <label className="form-label small fw-bold text-muted">Confirmer le mot de passe</label>
                            <input 
                                name="password_confirmation" 
                                type="password" 
                                className="form-control form-control-lg fs-6" 
                                placeholder="••••••••"
                                onChange={handleChange} 
                                style={{ borderRadius: '10px' }}
                                required 
                            />
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn btn-lg w-100 mb-3 text-white fw-bold shadow-sm d-flex align-items-center justify-content-center" 
                                style={{ 
                                    backgroundColor: loading ? colors.darkGreen : colors.successGreen, 
                                    border: 'none', 
                                    borderRadius: '10px',
                                    transition: '0.3s',
                                    height: '50px' // Hauteur fixe pour éviter le saut au chargement
                                }}
                                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = colors.darkGreen)}
                                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = colors.successGreen)}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Inscription...
                                    </>
                                ) : (
                                    "S'inscrire"
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-3 small">
                        <span className="text-muted">Vous avez déjà un compte ?</span>{' '}
                        <Link to="/login" className="fw-bold text-decoration-none" style={{ color: colors.orange }}>
                            Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;