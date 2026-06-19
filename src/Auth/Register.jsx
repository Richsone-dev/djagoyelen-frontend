import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg'; 

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', telephone: '', password: '', password_confirmation: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // États indépendants pour afficher/masquer les mots de passe
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
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

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754'
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3 p-sm-4" 
             style={{ backgroundColor: 'rgba(10, 59, 47, 0.03)' }}> {/* Rappel discret de darkGreen */}
            
            <div className="card shadow border-0 p-4 p-md-5" 
                 style={{ maxWidth: '680px', width: '100%', borderRadius: '20px' }}>
                
                {/* En-tête */}
                <div className="text-center mb-4">
                    <img 
                        src={logo} 
                        alt="Logo" 
                        className="rounded-circle border p-1"
                        style={{ width: '56px', height: '56px', borderRadius: '15px', objectFit: 'cover', borderColor: '#eee' }} 
                    />
                    <h2 className="fw-bold mt-3 mb-1 tracking-tight" style={{ color: colors.darkGreen }}>
                        Créez votre compte
                    </h2>
                    <p className="text-muted small">Rejoignez DjagoYelen pour gérer vos finances</p>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 border-0 text-start small py-2.5 px-3 rounded-3 mb-4">
                        <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                        <div>{error}</div>
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleRegister}>
                    <div className="row text-start">
                        
                        {/* Nom Complet - 12 colonnes sur mobile, 6 sur grand écran */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1 ps-1">
                                <i className="bi bi-person me-1.5"></i>Nom complet
                            </label>
                            <input 
                                name="name" 
                                type="text" 
                                className="form-control form-control-lg shadow-none" 
                                placeholder="Coulibaly Natacha" 
                                onChange={handleChange} 
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required 
                            />
                        </div>

                        {/* Adresse Email - 12 colonnes sur mobile, 6 sur grand écran */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1 ps-1">
                                <i className="bi bi-envelope me-1.5"></i>Adresse Email
                            </label>
                            <input 
                                name="email" 
                                type="email" 
                                className="form-control form-control-lg shadow-none" 
                                placeholder="exemple@mail.com" 
                                onChange={handleChange} 
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required 
                            />
                        </div>

                        {/* Téléphone - Prend toute la largeur de sa ligne */}
                        <div className="col-12 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1 ps-1">
                                <i className="bi bi-telephone me-1.5"></i>Numéro de téléphone
                            </label>
                            <input 
                                name="telephone" 
                                type="tel" 
                                className="form-control form-control-lg shadow-none" 
                                placeholder="06 12 34 56" 
                                onChange={handleChange} 
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required 
                            />
                        </div>

                        {/* Mot de passe */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1 ps-1">
                                <i className="bi bi-lock me-1.5"></i>Mot de passe
                            </label>
                            <div className="input-group">
                                <input 
                                    name="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="form-control form-control-lg shadow-none" 
                                    placeholder="**********" 
                                    onChange={handleChange} 
                                    style={{ 
                                        fontSize: '15px', 
                                        borderTopLeftRadius: '10px',
                                        borderBottomLeftRadius: '10px',
                                        border: '1.5px solid #dee2e6',
                                        borderRight: 'none'
                                    }}
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

                        {/* Confirmation Mot de passe */}
                        <div className="col-12 col-md-6 mb-4">
                            <label className="form-label fw-semibold text-secondary small mb-1 ps-1">
                                <i className="bi bi-shield-check me-1.5"></i>Confirmation
                            </label>
                            <div className="input-group">
                                <input 
                                    name="password_confirmation" 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    className="form-control form-control-lg shadow-none" 
                                    placeholder="**********" 
                                    onChange={handleChange} 
                                    style={{ 
                                        fontSize: '15px', 
                                        borderTopLeftRadius: '10px',
                                        borderBottomLeftRadius: '10px',
                                        border: '1.5px solid #dee2e6',
                                        borderRight: 'none'
                                    }}
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de Soumission */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn register-btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm transition-all mt-2"
                        style={{ backgroundColor: colors.successGreen, borderRadius: '10px', height: '50px', border: 'none' }}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                <span>Inscription en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>S'inscrire</span>
                                <i className="bi bi-arrow-right small"></i>
                            </>
                        )}
                    </button>
                </form>

                {/* Lien de redirection vers Connexion */}
                <div className="text-center mt-4">
                    <span className="text-muted small">Vous avez déjà un compte ? </span>
                    <Link to="/login" className="fw-bold text-decoration-none transition-all" style={{ color: colors.orange }}>
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;