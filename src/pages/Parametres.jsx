import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useEntreprise } from '../context/EntrepriseContext.jsx';

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
                            {activeTab === 'entreprise' && <EnterpriseSettings colors={colors} theme={theme} t={t} onSave={showFeedback} />}
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
// --- SOUS-COMPOSANT : ENTREPRISE ---
const EnterpriseSettings = ({ colors, theme, onSave }) => {
    const {
        entreprise,
        logoUrl,
        loading,
        hasEntreprise,
        createEntreprise,
        updateEntreprise,
    } = useEntreprise();

    const emptyInfo = { nom: '', ifu: '', tel: '', adresse: '', couleur_principale: '#198754', couleur_accent: '#E97223' };
    const [info, setInfo] = useState(emptyInfo);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isBlobValid, setIsBlobValid] = useState(false);
    const [saving, setSaving] = useState(false);

    // 1. GESTION DE L'AFFICHAGE DU LOGO (useEffect sécurisé)
    useEffect(() => {
        let isMounted = true;

        const checkAndSetLogo = async () => {
            if (!logoUrl) {
                if (isMounted) {
                    setLogoPreview(null);
                    setIsBlobValid(false);
                }
                return;
            }

            // Si l'utilisateur vient de choisir un fichier local, on ne l'écrase pas avec l'URL du serveur
            if (logoFile && logoPreview?.startsWith('blob:')) {
                return;
            }

            // Si c'est un blob (ex: suite à un changement d'état externe)
            if (logoUrl.startsWith('blob:')) {
                if (isMounted) {
                    setLogoPreview(logoUrl);
                    setIsBlobValid(true);
                }
                return;
            }

            // URL distante / Chemin serveur : Affichage immédiat
            if (isMounted) {
                setLogoPreview(logoUrl);
                setIsBlobValid(true);
            }

            // Vérification HEAD en tâche de fond pour la console
            try {
                const response = await fetch(logoUrl, { method: 'HEAD' });
                if (!response.ok && isMounted && !logoFile) {
                    setLogoPreview(null);
                    setIsBlobValid(false);
                }
            } catch (error) {
                // Erreur CORS ou réseau ignorée pour laisser l'image s'afficher
            }
        };

        if (entreprise) {
            setInfo({
                nom: entreprise.nom || '',
                ifu: entreprise.ifu || '',
                tel: entreprise.telephone || '',
                adresse: entreprise.adresse || '',
                couleur_principale: entreprise.couleur_principale || '#198754',
                couleur_accent: entreprise.couleur_accent || '#E97223',
            });
            checkAndSetLogo();
        } else if (!loading) {
            setInfo(emptyInfo);
            setLogoPreview(null);
            setIsBlobValid(false);
            setLogoFile(null);
        }

        return () => {
            isMounted = false;
        };
    }, [entreprise, logoUrl, loading]); // Ajout de logoFile retiré pour éviter les boucles de rendu lors de la sélection

    // 2. SÉLECTION D'UN NOUVEAU LOGO
    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Libère la mémoire de l'ancien blob local s'il y en avait un
        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        const newUrl = URL.createObjectURL(file);
        setLogoFile(file);      // Stocke le fichier réel pour le envoyer au serveur via FormData
        setLogoPreview(newUrl); // URL temporaire pour l'affichage <img src="..." />
        setIsBlobValid(true);
    };

    // 3. ENREGISTREMENT ET ENVOI AU BACKEND
    const handleSave = async () => {
        if (!info.nom.trim()) {
            onSave('Le nom de l\'entreprise est obligatoire', 'danger');
            return;
        }

        const payload = {
            nom: info.nom.trim(),
            ifu: info.ifu.trim(),
            telephone: info.tel.trim(),
            adresse: info.adresse.trim(),
            couleur_principale: info.couleur_principale,
            couleur_accent: info.couleur_accent,
        };

        try {
            setSaving(true);
            
            // On passe "logoFile" (qui contient le fichier ou null si inchangé) à ton contexte
            if (hasEntreprise) {
                await updateEntreprise(payload, logoFile);
                onSave('Entreprise et logo mis à jour avec succès !');
            } else {
                await createEntreprise(payload, logoFile);
                onSave('Entreprise créée avec succès !');
            }
            
            // On ne réinitialise logoFile qu'APRES le succès total de la requête réseau
            setLogoFile(null);
        } catch (error) {
            console.error("Erreur complète lors de la sauvegarde :", error);
            onSave(error.response?.data?.message || 'Erreur lors de l\'enregistrement', 'danger');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="text-muted mt-3 mb-0">Chargement de l'entreprise...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade">
            <div className="d-flex justify-content-between align-items-start mb-4 gap-3 flex-wrap">
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: colors.darkGreen }}>Informations Entreprise</h4>
                    <p className="text-muted small mb-0">
                        {hasEntreprise
                            ? 'Modifiez les informations affichées sur vos factures et dans l\'application.'
                            : 'Créez votre entreprise pour personnaliser votre espace et vos documents.'}
                    </p>
                </div>
                {hasEntreprise && (
                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(25, 135, 84, 0.12)', color: colors.darkGreen }}>
                        Entreprise active
                    </span>
                )}
            </div>

            {/* Zone d'upload du Logo */}
            <div className="text-center mb-4 p-4 border border-dashed rounded-4 bg-opacity-10 bg-secondary position-relative">
                <div className="mx-auto bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mb-2 overflow-hidden" style={{ width: '100px', height: '100px', border: `2px dashed ${colors.darkGreen}` }}>
                    {(logoPreview && isBlobValid) ? (
                        <img 
                            src={logoPreview} 
                            alt="Logo entreprise" 
                            className="w-100 h-100 object-fit-cover" 
                            onError={() => {
                                // Sécurité si le blob expire
                                if (!logoFile) {
                                    setIsBlobValid(false);
                                    setLogoPreview(null);
                                }
                            }}
                        />
                    ) : (
                        <i className="bi bi-building-add text-muted fs-2"></i>
                    )}
                </div>
                <input type="file" id="logoUpload" hidden accept="image/*" onChange={handleLogoChange} />
                <label htmlFor="logoUpload" className="btn btn-sm text-decoration-none fw-bold p-0 mt-2" style={{ color: colors.orange, cursor: 'pointer' }}>
                    {logoPreview ? 'Changer le logo' : 'Ajouter un logo'}
                </label>
            </div>

            <div className="row g-3">
                <div className="col-12">
                    <label className="form-label fw-bold small text-muted">Nom de l'entreprise</label>
                    <input
                        type="text"
                        className="form-control py-2"
                        value={info.nom}
                        onChange={(e) => setInfo({ ...info, nom: e.target.value })}
                        placeholder="Ex: Mon Entreprise SARL"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">N° IFU</label>
                    <input
                        type="text"
                        className="form-control py-2"
                        value={info.ifu}
                        onChange={(e) => setInfo({ ...info, ifu: e.target.value })}
                        placeholder="Identifiant fiscal"
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Téléphone</label>
                    <input
                        type="text"
                        className="form-control py-2"
                        value={info.tel}
                        onChange={(e) => setInfo({ ...info, tel: e.target.value })}
                        placeholder="+226 XX XX XX XX"
                    />
                </div>
                <div className="col-12">
                    <label className="form-label fw-bold small text-muted">Adresse</label>
                    <textarea
                        className="form-control py-2"
                        rows="2"
                        value={info.adresse}
                        onChange={(e) => setInfo({ ...info, adresse: e.target.value })}
                        placeholder="Ville, quartier, rue..."
                    />
                </div>
                
                {/* Charte Graphique */}
                <div className="col-12 mt-4">
                    <label className="form-label fw-bold small text-muted mb-2">Charte graphique de l'entreprise</label>
                    <div className="alert d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-0 border-1-danger" 
                         style={{ backgroundColor: 'rgba(233, 114, 35, 0.1)', color: colors.orange, border: `1px dashed ${colors.orange}` }}>
                        <i className="bi bi-info-circle-fill"></i>
                        <small className="fst-italic">
                            Ces couleurs seront utilisées pour vos factures. Prenez le soin de bien selctionner vos couleurs en fonction de celles de votre logo afin d'obtenir un design plus professionel !
                        </small>
                    </div>
                </div>

                {/* Couleur principale */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Couleur principale (factures)</label>
                    <div className="p-2 rounded-3 d-flex align-items-center gap-3 border" 
                         style={{ backgroundColor: theme === 'dark' ? '#2b2b2b' : '#f8f9fa', borderColor: theme === 'dark' ? '#3d3d3d' : '#dee2e6' }}>
                        <input
                            type="color"
                            className="form-control form-control-color border-0 bg-transparent p-0"
                            style={{ width: '38px', height: '38px', cursor: 'pointer' }}
                            value={info.couleur_principale}
                            onChange={(e) => setInfo({ ...info, couleur_principale: e.target.value })}
                        />
                        <div>
                            <span className="fw-semibold small d-block" style={{ color: colors.textColor }}>{info.couleur_principale.toUpperCase()}</span>
                            <span className="text-muted d-block" style={{ fontSize: '11px' }}>En-têtes et totaux</span>
                        </div>
                    </div>
                </div>

                {/* Couleur d'accent */}
                <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Couleur d'accent (factures)</label>
                    <div className="p-2 rounded-3 d-flex align-items-center gap-3 border" 
                         style={{ backgroundColor: theme === 'dark' ? '#2b2b2b' : '#f8f9fa', borderColor: theme === 'dark' ? '#3d3d3d' : '#dee2e6' }}>
                        <input
                            type="color"
                            className="form-control form-control-color border-0 bg-transparent p-0"
                            style={{ width: '38px', height: '38px', cursor: 'pointer' }}
                            value={info.couleur_accent}
                            onChange={(e) => setInfo({ ...info, couleur_accent: e.target.value })}
                        />
                        <div>
                            <span className="fw-semibold small d-block" style={{ color: colors.textColor }}>{info.couleur_accent.toUpperCase()}</span>
                            <span className="text-muted d-block" style={{ fontSize: '11px' }}>Bannières et détails</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                    className="btn px-4 fw-bold text-white border-0"
                    style={{ backgroundColor: colors.darkGreen }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Enregistrement...' : hasEntreprise ? 'Mettre à jour' : 'Créer mon entreprise'}
                </button>
            </div>
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

    useEffect(() => {
        if (typeof Notification !== 'undefined') setPermission(Notification.permission);
    }, []);

    return (
        <div className="animate-fade">
            <h4 className="fw-bold mb-3" style={{ color: colors.darkGreen }}>Gestion des Alertes</h4>
        </div>
    );
};

// --- SOUS-COMPOSANT : SÉCURITÉ ---
const SecuritySettings = ({ colors, onSave }) => {
    return (
        <div className="animate-fade text-start">
            <h4 className="fw-bold mb-4" style={{ color: colors.darkGreen }}>Sécurité & Accès</h4>
        </div>
    );
};

export default Parametres;