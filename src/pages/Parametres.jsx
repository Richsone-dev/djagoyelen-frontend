import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../api/axios';

const Parametres = () => {
    const { theme, setTheme, colors } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const [activeTab, setActiveTab] = useState('general');
    const [status, setStatus] = useState({ type: '', msg: '' });

    const showFeedback = (msg, type = 'success') => {
        setStatus({ msg, type });
        setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
    };

    // Liens du menu latéral
    const tabs = [
        { id: 'general', icon: 'gear-wide-connected', label: t('general') },
        { id: 'entreprise', icon: 'building', label: t('enterprise') },
        { id: 'notifications', icon: 'bell', label: t('notificationSettings') },
        { id: 'securite', icon: 'shield-lock', label: t('security') }
    ];

    return (
        <div className="py-4 py-md-5 transition-all" style={{ backgroundColor: colors.bgLight, minHeight: '100vh', color: colors.textColor }}>
            <div className="container px-3 px-md-4">
                
                {/* Notification Alert */}
                {status.msg && (
                    <div className={`alert alert-${status.type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg border-0 animate-fade`} style={{ zIndex: 1050 }}>
                        <i className={`bi ${status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                        {status.msg}
                    </div>
                )}

                <div className="row g-4">
                    {/* --- MENU LATÉRAL --- */}
                    <div className="col-12 col-md-4 col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-3 sticky-md-top" style={{ top: '20px', backgroundColor: colors.cardBg }}>
                            <h5 className="fw-bold mb-4 px-2" style={{ color: colors.darkGreen }}>Réglages</h5>
                            <div className="nav flex-column nav-pills gap-2">
                                {tabs.map((tab) => (
                                    <button 
                                        key={tab.id}
                                        className={`nav-link text-start border-0 rounded-3 py-3 transition-all ${activeTab === tab.id ? 'active shadow-sm text-white' : 'text-muted'}`}
                                        style={{ backgroundColor: activeTab === tab.id ? colors.darkGreen : 'transparent' }}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <i className={`bi bi-${tab.icon} me-2`}></i> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- CONTENU DYNAMIQUE --- */}
                    <div className="col-12 col-md-8 col-lg-9 text-start">
                        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5" style={{ backgroundColor: colors.cardBg }}>
                            {activeTab === 'general' && <GeneralSettings colors={colors} theme={theme} setTheme={setTheme} language={language} setLanguage={setLanguage} t={t} onSave={showFeedback} />}
                            {activeTab === 'entreprise' && <EnterpriseSettings colors={colors} t={t} onSave={showFeedback} />}
                            {activeTab === 'notifications' && <NotificationSettings colors={colors} t={t} />}
                            {activeTab === 'securite' && <SecuritySettings colors={colors} t={t} onSave={showFeedback} />}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .nav-link:hover:not(.active) { background-color: rgba(10, 59, 47, 0.05) !important; color: ${colors.darkGreen} !important; }
                .form-control, .form-select { background-color: ${theme === 'dark' ? '#2b2b2b' : '#f8f9fa'} !important; color: ${colors.textColor} !important; border: 1px solid ${theme === 'dark' ? '#3d3d3d' : '#dee2e6'}; }
                .form-control:focus { border-color: ${colors.orange} !important; box-shadow: none !important; }
                .animate-fade { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .transition-all { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

// --- SOUS-COMPOSANT : GÉNÉRAL ---
const GeneralSettings = ({ colors, theme, setTheme, language, setLanguage, t, onSave }) => {
    const [currency, setCurrency] = useState(localStorage.getItem('devise') || 'FCFA (XOF)');

    const handleSave = () => {
        localStorage.setItem('devise', currency);
        onSave(t('statusSaved'));
    };

    return (
        <div className="animate-fade">
            <h4 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>{t('general')}</h4>
            <div className="row g-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">{t('language')}</label>
                    <select className="form-select py-2 shadow-none" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">{t('currency')}</label>
                    <select className="form-select py-2 shadow-none" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option>FCFA (XOF)</option>
                        <option>Euro (€)</option>
                        <option>Dollar ($)</option>
                    </select>
                </div>
                <div className="col-12">
                    <label className="form-label fw-bold small text-muted d-block mb-3">{t('appearance')}</label>
                    <div className="d-flex gap-3">
                        <button className={`btn flex-grow-1 py-3 border-2 transition-all ${theme === 'light' ? 'bg-white shadow-sm' : 'border-secondary text-muted'}`}
                                onClick={() => setTheme('light')}
                                style={{ borderColor: theme === 'light' ? colors.darkGreen : 'transparent' }}>
                            <i className="bi bi-sun me-2"></i> {t('light')}
                        </button>
                        <button className={`btn flex-grow-1 py-3 border-2 transition-all ${theme === 'dark' ? 'bg-dark text-white shadow-sm' : 'border-secondary text-muted'}`}
                                onClick={() => setTheme('dark')}
                                style={{ borderColor: theme === 'dark' ? colors.orange : 'transparent' }}>
                            <i className="bi bi-moon-stars me-2"></i> {t('dark')}
                        </button>
                    </div>
                </div>
            </div>
            <button className="btn mt-5 px-5 fw-bold text-white shadow-sm border-0" style={{ backgroundColor: colors.orange }} onClick={handleSave}>{t('save')}</button>
        </div>
    );
};

// --- SOUS-COMPOSANT : ENTREPRISE ---
const EnterpriseSettings = ({ colors, onSave }) => {
    const [info, setInfo] = useState({ nom: 'Mon Entreprise', ifu: '', tel: '+226 ', adresse: 'Bobo-Dioulasso' });
    const [logo, setLogo] = useState(null);

    return (
        <div className="animate-fade">
            <h4 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>Informations Entreprise</h4>
            <div className="text-center mb-4 p-4 border border-dashed rounded-4 bg-opacity-10 bg-secondary position-relative">
                <div className="mx-auto bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-2 overflow-hidden" style={{ width: '100px', height: '100px', border: `2px dashed ${colors.darkGreen}` }}>
                    {logo ? <img src={logo} alt="Logo" className="w-100 h-100 object-fit-cover" /> : <i className="bi bi-building-add text-muted fs-2"></i>}
                </div>
                <input type="file" id="logoUpload" hidden onChange={(e) => e.target.files[0] && setLogo(URL.createObjectURL(e.target.files[0]))} />
                <label htmlFor="logoUpload" className="btn btn-sm text-decoration-none fw-bold p-0 mt-2" style={{ color: colors.orange, cursor: 'pointer' }}>{logo ? "Changer le Logo" : "Ajouter un Logo"}</label>
            </div>
            <div className="row g-3">
                <div className="col-12">
                    <label className="form-label fw-bold small text-muted">Nom de l'entreprise</label>
                    <input type="text" className="form-control py-2" value={info.nom} onChange={e => setInfo({...info, nom: e.target.value})} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">N° IFU</label>
                    <input type="text" className="form-control py-2" value={info.ifu} onChange={e => setInfo({...info, ifu: e.target.value})} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Téléphone</label>
                    <input type="text" className="form-control py-2" value={info.tel} onChange={e => setInfo({...info, tel: e.target.value})} />
                </div>
            </div>
            <button className="btn mt-4 px-4 fw-bold text-white border-0" style={{ backgroundColor: colors.darkGreen }} onClick={() => onSave("Mise à jour réussie")}>Mettre à jour</button>
        </div>
    );
};

// --- SOUS-COMPOSANT : NOTIFICATIONS ---
const NotificationSettings = ({ colors }) => {
    const [notifs, setNotifs] = useState([
        { id: 1, title: "Seuils Budgétaires", desc: "Alerte quand un budget dépasse 80%", active: true },
        { id: 2, title: "Rapports Hebdomadaires", desc: "Résumé PDF envoyé par email", active: false }
    ]);

    const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');

    const toggle = (id) => {
        setNotifs(notifs.map(n => n.id === id ? { ...n, active: !n.active } : n));
    };

    const requestPermission = async () => {
        if (typeof Notification === 'undefined') return;
        try {
            const p = await Notification.requestPermission();
            setPermission(p);
        } catch (e) {
            console.warn('Notification permission error', e);
        }
    };

    React.useEffect(() => {
        if (typeof Notification !== 'undefined') setPermission(Notification.permission);
    }, []);

    return (
        <div className="animate-fade">
            <h4 className="fw-bold mb-3" style={{ color: colors.darkGreen }}>Gestion des Alertes</h4>

            <div className="mb-3 p-3 border rounded-4 shadow-sm d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="mb-1 fw-bold">Notifications Système</h6>
                    <p className="small text-muted mb-0">Permettre aux notifications de votre navigateur d'apparaître quand de nouvelles alertes arrivent.</p>
                </div>
                <div className="text-end">
                    <div className="small text-muted mb-1">Statut: <span className="fw-bold">{permission}</span></div>
                    {permission !== 'granted' ? (
                        <button className="btn btn-sm btn-outline-primary" onClick={requestPermission}>Autoriser</button>
                    ) : (
                        <button className="btn btn-sm btn-outline-success" disabled>Autorisé</button>
                    )}
                </div>
            </div>

            <div className="d-flex flex-column gap-3">
                {notifs.map((item) => (
                    <div key={item.id} className="d-flex justify-content-between align-items-center p-3 border rounded-4 shadow-sm">
                        <div>
                            <h6 className="mb-1 fw-bold">{item.title}</h6>
                            <p className="small text-muted mb-0">{item.desc}</p>
                        </div>
                        <div className="form-check form-switch fs-4">
                            <input className="form-check-input" type="checkbox" checked={item.active} onChange={() => toggle(item.id)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANT : SÉCURITÉ ---
const SecuritySettings = ({ colors, onSave }) => {
    return (
        <div className="animate-fade text-start">
            <h4 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>Sécurité & Accès</h4>
            <div className="row g-3">
                <div className="col-12">
                    <label className="form-label fw-bold small text-muted">Ancien mot de passe</label>
                    <input type="password" className="form-control py-2 shadow-none" />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Nouveau mot de passe</label>
                    <input type="password" className="form-control py-2 shadow-none" />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Confirmer</label>
                    <input type="password" className="form-control py-2 shadow-none" />
                </div>
            </div>
            
            <div className="mt-5 p-4 border border-danger border-opacity-25 rounded-4 bg-danger bg-opacity-10">
                <h6 className="text-danger fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Zone de danger</h6>
                <p className="small text-muted">La suppression du compte est irréversible.</p>
                <button className="btn btn-sm btn-danger fw-bold" onClick={() => window.confirm("Supprimer ?")}>Supprimer le compte</button>
            </div>
            
            <button className="btn mt-4 px-4 fw-bold text-white shadow-sm border-0" style={{ backgroundColor: colors.orange }} onClick={() => onSave("Mot de passe modifié")}>Appliquer</button>
        </div>
    );
};

export default Parametres;