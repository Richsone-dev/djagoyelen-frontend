import { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import logo from '../assets/djago-logo.jpeg';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        telephone: '', 
        password: '', 
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setInfo('');

        if (formData.password !== formData.password_confirmation) {
            return setError('Les mots de passe ne correspondent pas.');
        }

        setLoading(true);
        try {
            const response = await api.post('/register', formData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.location.href = '/#/dashboard';
        } catch (err) {
            setError(
                err.response?.data?.message
                || err.response?.data?.errors?.telephone?.[0]
                || 'Erreur lors de l\'inscription.'
            );
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-3 p-sm-4"
             //style={{ backgroundColor: 'rgba(10, 59, 47, 0.03)' }}
             >

            <div className="card border-0 p-4 p-md-5"
                 style={{ maxWidth: '680px', width: '100%', borderRadius: '20px' }}>

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
                    <p className="text-muted small">Veuillez renseigner vos informations pour continuer</p>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 border-0 text-start small py-2.5 px-3 rounded-3 mb-4">
                        <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                        <div>{error}</div>
                    </div>
                )}

                {info && (
                    <div className="alert alert-success d-flex align-items-center gap-2 border-0 text-start small py-2.5 px-3 rounded-3 mb-4">
                        <i className="bi bi-check-circle-fill flex-shrink-0"></i>
                        <div>{info}</div>
                    </div>
                )}

                <form onSubmit={handleRegister} className="text-start">
                    <div className="row">
                        {/* Nom complet */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1">Nom complet</label>
                            <input
                                name="name"
                                type="text"
                                className="form-control form-control-lg shadow-none"
                                placeholder="Coulibaly Natacha"
                                value={formData.name}
                                onChange={handleChange}
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required
                            />
                        </div>

                        {/* Adresse Email */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1">Adresse Email</label>
                            <input
                                name="email"
                                type="email"
                                className="form-control form-control-lg shadow-none"
                                placeholder="exemple@mail.com"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required
                            />
                        </div>

                        {/* Numéro de téléphone */}
                        <div className="col-12 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1">Numéro de téléphone</label>
                            <input
                                name="telephone"
                                type="tel"
                                className="form-control form-control-lg shadow-none"
                                placeholder="70 12 34 56"
                                value={formData.telephone}
                                onChange={handleChange}
                                style={{ fontSize: '15px', borderRadius: '10px', border: '1.5px solid #dee2e6' }}
                                required
                            />
                        </div>

                        {/* Mot de passe */}
                        <div className="col-12 col-md-6 mb-3">
                            <label className="form-label fw-semibold text-secondary small mb-1">Mot de passe</label>
                            <div className="input-group">
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control form-control-lg shadow-none"
                                    placeholder="**********"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ fontSize: '15px', borderRadius: '10px 0 0 10px', border: '1.5px solid #dee2e6', borderRight: 'none' }}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary bg-white px-3"
                                    style={{ borderRadius: '0 10px 10px 0', border: '1.5px solid #dee2e6', borderLeft: 'none' }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Confirmation Mot de passe */}
                        <div className="col-12 col-md-6 mb-4">
                            <label className="form-label fw-semibold text-secondary small mb-1">Confirmation</label>
                            <div className="input-group">
                                <input
                                    name="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="form-control form-control-lg shadow-none"
                                    placeholder="**********"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    style={{ fontSize: '15px', borderRadius: '10px 0 0 10px', border: '1.5px solid #dee2e6', borderRight: 'none' }}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary bg-white px-3"
                                    style={{ borderRadius: '0 10px 10px 0', border: '1.5px solid #dee2e6', borderLeft: 'none' }}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bouton de soumission */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                        style={{ backgroundColor: colors.darkGreen, borderRadius: '10px', height: '50px', border: 'none' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                <span>Inscription en cours...</span>
                            </>
                        ) : (
                            <>
                                <span>Créer mon compte</span>
                                <i className="bi bi-arrow-right small"></i>
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <span className="text-muted small">Vous avez déjà un compte ? </span>
                    <Link to="/login" className="fw-bold text-decoration-none" style={{ color: colors.orange }}>
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;