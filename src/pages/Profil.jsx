import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { useLanguage } from '../context/LanguageContext.jsx';

// --- SKELETON ---
const SkeletonSidebar = () => (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden placeholder-glow">
        <div style={{ height: '100px', backgroundColor: '#e9ecef' }}></div>

        <div
            className="card-body text-center pt-0"
            style={{ marginTop: '-50px' }}
        >
            <div
                className="rounded-circle mx-auto mb-3 placeholder"
                style={{ width: '100px', height: '100px' }}
            ></div>

            <div className="placeholder col-8 mb-2 py-2 mx-auto"></div>
            <div className="placeholder col-5 py-2 mx-auto"></div>

            <div className="p-3 bg-light rounded-3 mt-3">
                <div className="placeholder col-12 mb-2"></div>
                <div className="placeholder col-10"></div>
            </div>
        </div>
    </div>
);

const Profil = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [clients, setClients] = useState([]);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingClient, setSavingClient] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [status, setStatus] = useState({
        type: '',
        msg: ''
    });

    // ---------------- PROFILE FORM ----------------
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telephone: ''
    });

    const { t } = useLanguage();

    // ---------------- PASSWORD FORM ----------------
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    // ---------------- CLIENTS ----------------
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);

    const [clientFormData, setClientFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        adresse: ''
    });

    const theme = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#28a745',
        bgLight: '#F8F9FA'
    };

    // ---------------- ALERT ----------------
    const showFeedback = useCallback((type, msg) => {
        setStatus({ type, msg });

        setTimeout(() => {
            setStatus({
                type: '',
                msg: ''
            });
        }, 4000);
    }, []);

    // ---------------- LOAD DATA ----------------
    const loadData = useCallback(async (showSkeleton = true) => {
        try {
            if (showSkeleton) {
                setLoading(true);
            }

            const [userRes, clientsRes] = await Promise.all([
                api.get('/user/profile'),
                api.get('/clients')
            ]);

            // Extraire les données utilisateur correctement
            const userData = userRes.data.data || userRes.data.user || userRes.data;

            console.log('User data loaded:', userData);

            setUser(userData);

            setFormData({
                name: userData?.name || '',
                email: userData?.email || '',
                telephone: userData?.telephone || ''
            });
            
            //const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';
            const baseUrl = 'http://localhost:8000';
            const photoUrl = userData?.id_photo
                ? (userData.id_photo.startsWith('http') ? userData.id_photo : `${baseUrl}${userData.id_photo}`)
                : null;
            console.log('Photo URL:', photoUrl);
            setPhotoPreview(photoUrl);

            setClients(clientsRes.data || []);
        } catch (error) {
            console.error('Load data error:', error);

            showFeedback(
                'danger',
                "Impossible de charger les données."
            );
        } finally {
            setLoading(false);
        }
    }, [showFeedback]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ---------------- PROFILE UPDATE ----------------
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            setSavingProfile(true);

            const data = new FormData();
            data.append('name', formData.name.trim());
            data.append('email', formData.email.trim());
            data.append('telephone', formData.telephone.trim());
            
            if (photo) {
                data.append('photo', photo);
            }

            // Utilisation du spoofing de méthode pour Laravel car PUT ne supporte pas multipart/form-data nativement
            data.append('_method', 'PUT');

            const response = await api.post('/user/profile', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // IMPORTANT :
            // on met immédiatement à jour le state
            // pour que les nouvelles données apparaissent
            const updatedUser = response.data.data;

            console.log('Updated user response:', updatedUser);

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            const baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_API_URL || 'http://localhost:8000';
            const photoUrl = updatedUser.id_photo
                ? (updatedUser.id_photo.startsWith('http') ? updatedUser.id_photo : `${baseUrl}${updatedUser.id_photo}`)
                : null;
            console.log('Updated photo URL:', photoUrl);
            setPhotoPreview(photoUrl);

            setFormData({
                name: updatedUser.name || '',
                email: updatedUser.email || '',
                telephone: updatedUser.telephone || ''
            });

            setIsEditing(false);
            setPhoto(null);

            showFeedback(
                'success',
                'Profil mis à jour avec succès.'
            );

            // Recharger les données du profil après 500ms pour s'assurer que la photo est visible en BD
            setTimeout(() => {
                loadData(false);
            }, 500);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;

                const firstError =
                    Object.values(errors)[0][0];

                showFeedback('danger', firstError);
            } else {
                showFeedback(
                    'danger',
                    error.response?.data?.message ||
                        'Erreur lors de la mise à jour du profil.'
                );
            }
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setIsEditing(true);
        }
    };

    // ---------------- PASSWORD UPDATE ----------------
    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (
            passwordData.password !==
            passwordData.password_confirmation
        ) {
            return showFeedback(
                'danger',
                'Les mots de passe ne correspondent pas.'
            );
        }

        try {
            setSavingPassword(true);

            await api.put('/user/password', passwordData);

            setPasswordData({
                current_password: '',
                password: '',
                password_confirmation: ''
            });

            setShowPasswordForm(false);

            showFeedback(
                'success',
                'Mot de passe modifié avec succès.'
            );
        } catch (error) {
            console.error(error);

            showFeedback(
                'danger',
                error.response?.data?.message ||
                    'Erreur lors du changement de mot de passe.'
            );
        } finally {
            setSavingPassword(false);
        }
    };

    // ---------------- OPEN MODAL ----------------
    const openClientModal = (client = null) => {
        if (client) {
            setEditingClient(client);

            setClientFormData({
                nom: client.nom || '',
                telephone: client.telephone || '',
                email: client.email || '',
                adresse: client.adresse || ''
            });
        } else {
            setEditingClient(null);

            setClientFormData({
                nom: '',
                telephone: '',
                email: '',
                adresse: ''
            });
        }

        setIsClientModalOpen(true);
    };

    // ---------------- CLIENT CREATE / UPDATE ----------------
    const handleClientSubmit = async (e) => {
        e.preventDefault();

        try {
            setSavingClient(true);

            const payload = {
                nom: clientFormData.nom.trim(),
                telephone: clientFormData.telephone.trim(),
                email: clientFormData.email.trim(),
                adresse: clientFormData.adresse.trim()
            };

            let response;

            if (editingClient) {
                response = await api.put(
                    `/clients/${editingClient.id}`,
                    payload
                );

                // mise à jour instantanée locale
                setClients((prev) =>
                    prev.map((client) =>
                        client.id === editingClient.id
                            ? response.data.client || response.data
                            : client
                    )
                );

                showFeedback(
                    'success',
                    'Client mis à jour avec succès.'
                );
            } else {
                response = await api.post(
                    '/clients',
                    payload
                );

                // ajout instantané local
                setClients((prev) => [
                    response.data.client || response.data,
                    ...prev
                ]);

                showFeedback(
                    'success',
                    'Client ajouté avec succès.'
                );
            }

            setIsClientModalOpen(false);

            setClientFormData({
                nom: '',
                telephone: '',
                email: '',
                adresse: ''
            });

            setEditingClient(null);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;

                const firstError =
                    Object.values(errors)[0][0];

                showFeedback('danger', firstError);
            } else {
                showFeedback(
                    'danger',
                    error.response?.data?.message ||
                        "Erreur lors de l'enregistrement."
                );
            }
        } finally {
            setSavingClient(false);
        }
    };

    // ---------------- DELETE CLIENT ----------------
    const handleDeleteClient = async (id) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Cette action est irréversible !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            cancelButtonText: 'Annuler',
            confirmButtonText: 'Oui, supprimer'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/clients/${id}`);

                setClients((prevClients) =>
                    prevClients.filter(
                        (client) => client.id !== id
                    )
                );

                Swal.fire(
                    'Supprimé !',
                    'Le client a été supprimé.',
                    'success'
                );
            } catch (err) {
                console.error(err);

                Swal.fire(
                    'Erreur',
                    err.response?.data?.message ||
                        'Erreur lors de la suppression.',
                    'error'
                );
            }
        }
    };

    // ---------------- LOGOUT ----------------
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Déconnexion',
            text: 'Voulez-vous vraiment vous déconnecter ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler'
        });

        try {
            await api.post('/logout');
        } catch (error) {
            // Même si erreur, on déconnecte côté frontend
        } finally {
            localStorage.clear();
            navigate('/login', { replace: true });
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    return (
        <div
            className="py-4"
            style={{
                minHeight: '100vh'
            }}
        >
            <div
                className="container"
                style={{ maxWidth: '1100px' }}
            >
                {/* STATUS */}
                {status.msg && (
    <div className={`alert alert-${status.type} border-0 shadow-sm text-center fw-bold`}>
        {status.msg}
    </div>
)}

<div className="row g-4">
    {/* SIDEBAR */}
    <div className="col-12 col-lg-4">
        {loading ? (
            <SkeletonSidebar />
        ) : (
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                <div
                    style={{
                        height: '100px',
                        backgroundColor: theme.darkGreen,
                        borderRadius: '0 0 30px 30px'
                    }}
                ></div>

                <div
                    className="card-body text-center pt-0"
                    style={{
                        marginTop: '-70px',
                        boxShadow: '-moz-initial'
                    }}
                >
                    <div className="position-relative mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
                        {/* Gestion de l'affichage de la photo avec repli vers la lettre */}
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                                className="rounded-circle border border-4 border-white shadow-sm object-fit-cover w-100 h-100"
                                /* Si l'adresse dans la BD est cassée ou inaccessible, on repasse à null */
                                onError={() => setPhotoPreview(null)} 
                            />
                        ) : (
                            <div
                                className="rounded-circle border border-4 border-white shadow-sm d-flex align-items-center justify-content-center w-100 h-100"
                                style={{
                                    backgroundColor: theme.orange,
                                    color: 'white',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                        )}

                        <label
                            htmlFor="photo-upload"
                            className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                            style={{ width: '32px', height: '32px', cursor: 'pointer', border: '1px solid #ddd' }}
                        >
                            <i className="bi bi-camera-fill text-dark"></i>
                            <input
                                id="photo-upload"
                                type="file"
                                className="d-none"
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                        </label>
                    </div>

                    <h5 className="fw-bold mb-0">
                        {user?.name}
                    </h5>

                    <p className="text-muted small mb-3">
                        {user?.email}
                    </p>

                    <div className="p-3 rounded-3 mb-3" style={{border: '1px solid orange', backgroundColor: 'rgba(233, 233, 192, 0.12)'}}>
                        <div className="d-flex justify-content-between small mb-1">
                            <span className="text-muted">
                                Téléphone :
                            </span>

                            <span className="fw-bold">
                                {user?.telephone || 'N/A'}
                            </span>
                        </div>

                        <div className="d-flex justify-content-between small">
                            <span className="text-muted">
                                Clients :
                            </span>

                            <span className="fw-bold">
                                {clients.length}
                            </span>
                        </div>
                    </div>

                    <button
                        className="btn btn-sm btn-outline-danger w-100 rounded-pill fw-bold border-0 border-1-danger"
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        {t('logout')}
                    </button>
                </div>
            </div>
        )}

                        {/* PASSWORD */}
                        <div className="card border-0 shadow-sm rounded-4 p-3">
                            <h6 className="fw-bold mb-3">
                                <i className="bi bi-shield-lock me-2 text-primary"></i>
                                {t('security')}
                            </h6>

                            {!showPasswordForm ? (
                                <button
                                    className="btn btn-sm w-100 py-2 btn-outline-danger border rounded-3 fw-bold shadow-sm"
                                    onClick={() =>
                                        setShowPasswordForm(
                                            true
                                        )
                                    }
                                >
                                    Changer le mot de passe
                                </button>
                            ) : (
                                <form
                                    onSubmit={
                                        handleUpdatePassword
                                    }
                                >
                                    <input
                                        type="password"
                                        className="form-control form-control-sm mb-2"
                                        placeholder="Ancien mot de passe"
                                        required
                                        value={
                                            passwordData.current_password
                                        }
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                current_password:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                    <input
                                        type="password"
                                        className="form-control form-control-sm mb-2"
                                        placeholder="Nouveau mot de passe"
                                        required
                                        value={
                                            passwordData.password
                                        }
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                password:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                    <input
                                        type="password"
                                        className="form-control form-control-sm mb-2"
                                        placeholder="Confirmation"
                                        required
                                        value={
                                            passwordData.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setPasswordData({
                                                ...passwordData,
                                                password_confirmation:
                                                    e.target
                                                        .value
                                            })
                                        }
                                    />

                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-dark btn-sm flex-grow-1 fw-bold"
                                            disabled={
                                                savingPassword
                                            }
                                        >
                                            {savingPassword
                                                ? 'Chargement...'
                                                : 'Valider'}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-light btn-sm border"
                                            onClick={() =>
                                                setShowPasswordForm(
                                                    false
                                                )
                                            }
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* CONTENT */}
                    <div className="col-12 col-lg-8 ">
                        {/* PROFILE */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4 border border-2-success">
                            <div className="card-header border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">
                                    {t('personalInfo')}
                                </h5>

                                {!isEditing && (
                                    <button
                                        className="btn btn-sm btn-success border fw-bold shadow-sm"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bi bi-pencil-square me-2"></i>
                                        {t('edit')}
                                    </button>
                                )}
                            </div>

                            <div className="card-body p-4">
                                <form
                                    onSubmit={
                                        handleUpdateProfile
                                    }
                                >
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">
                                                {t('name')}
                                            </label>

                                            <input
                                                type="text"
                                                className={`form-control ${
                                                    isEditing
                                                        ? ''
                                                        : 'bg-gray',
                                                    
                                                    isEditing
                                                        ? 'border-orange'
                                                        : 'border-success'
                                                }`}
                                                value={
                                                    formData.name
                                                }
                                                readOnly={
                                                    !isEditing
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        name: e
                                                            .target
                                                            .value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">
                                                {t('email')}
                                            </label>

                                            <input
                                                type="email"
                                                className={`form-control ${
                                                    isEditing
                                                        ? ''
                                                        : 'bg-gray',
                                                    
                                                    isEditing
                                                        ? 'border-orange'
                                                        : 'border-success'
                                                }`}
                                                value={
                                                    formData.email
                                                }
                                                readOnly={
                                                    !isEditing
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        email: e
                                                            .target
                                                            .value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">
                                                {t('telephone')}
                                            </label>

                                            <input
                                                type="text"
                                                className={`form-control ${
                                                    isEditing
                                                        ? ''
                                                        : 'bg-gray',
                                                    isEditing
                                                        ? 'border-orange'
                                                        : 'border-success'
                                                }`}
                                                value={
                                                    formData.telephone
                                                }
                                                readOnly={
                                                    !isEditing
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        telephone:
                                                            e
                                                                .target
                                                                .value
                                                    })
                                                }
                                            />
                                        </div>

                                        {isEditing && (
                                            <div className="col-12 mt-3 d-flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn text-white fw-bold shadow-sm"
                                                    style={{
                                                        backgroundColor:
                                                            theme.orange
                                                    }}
                                                    disabled={
                                                        savingProfile
                                                    }
                                                >
                                                    {savingProfile
                                                        ? 'Sauvegarde...'
                                                        : 'Sauvegarder'}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn btn-light border"
                                                    onClick={() => {
                                                        setIsEditing(
                                                            false
                                                        );

                                                        setFormData(
                                                            {
                                                                name:
                                                                    user?.name ||
                                                                    '',
                                                                email:
                                                                    user?.email ||
                                                                    '',
                                                                telephone:
                                                                    user?.telephone ||
                                                                    ''
                                                            }
                                                        );
                                                    }}
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* CLIENTS */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header border-0 pt-4 px-4 d-flex justify-content-between align-items-center" style={{border: '3px solid success'}}>
                                <h5
                                    className="fw-bold mb-0"
                                >
                                    Partenaires & Clients
                                </h5>

                                <button
                                    className="btn btn-sm text-white fw-bold rounded-pill shadow-sm"
                                    style={{
                                        backgroundColor:
                                            theme.darkGreen
                                    }}
                                    onClick={() =>
                                        openClientModal()
                                    }
                                >
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Nouveau
                                </button>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">
                                                    Identité
                                                </th>

                                                <th>
                                                    Contact
                                                </th>

                                                <th className="text-end pe-4">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                [...Array(3)].map(
                                                    (
                                                        _,
                                                        i
                                                    ) => (
                                                        <tr
                                                            key={
                                                                i
                                                            }
                                                        >
                                                            <td className="ps-4">
                                                                Chargement...
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : clients.length >
                                              0 ? (
                                                clients.map(
                                                    (
                                                        client
                                                    ) => (
                                                        <tr
                                                            key={
                                                                client.id
                                                            }
                                                        >
                                                            <td className="ps-4 py-3">
                                                                <div className="fw-bold">
                                                                    {
                                                                        client.nom
                                                                    }
                                                                </div>

                                                                <div className="small text-muted">
                                                                    {client.adresse ||
                                                                        'Aucune adresse'}
                                                                </div>
                                                            </td>

                                                            <td className="py-3">
                                                                <div className="fw-bold text-primary">
                                                                    {
                                                                        client.telephone
                                                                    }
                                                                </div>

                                                                <div className="small text-muted">
                                                                    {client.email ||
                                                                        'N/A'}
                                                                </div>
                                                            </td>

                                                            <td className="text-end pe-4 py-3">
                                                                <div className="btn-group">
                                                                    <button
                                                                        className="btn btn-sm btn-light border"
                                                                        onClick={() =>
                                                                            openClientModal(
                                                                                client
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="bi bi-pencil text-primary"></i>
                                                                    </button>

                                                                    <button
                                                                        className="btn btn-sm btn-light border"
                                                                        onClick={() =>
                                                                            handleDeleteClient(
                                                                                client.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="bi bi-trash text-danger"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="3"
                                                        className="text-center py-5 text-muted"
                                                    >
                                                        Aucun
                                                        client
                                                        enregistré.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {isClientModalOpen && (
                <div
                    className="modal d-block"
                    style={{
                        backgroundColor:
                            'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(3px)',
                        zIndex: 1060
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg">
                            <form
                                onSubmit={
                                    handleClientSubmit
                                }
                            >
                                <div className="modal-header border-0 p-4">
                                    <h5 className="fw-bold mb-0">
                                        {editingClient
                                            ? 'Modifier Client'
                                            : 'Ajouter Client'}
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() =>
                                            setIsClientModalOpen(
                                                false
                                            )
                                        }
                                    ></button>
                                </div>

                                <div className="modal-body px-4 pb-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label small fw-bold">
                                                Nom
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                required
                                                value={
                                                    clientFormData.nom
                                                }
                                                onChange={(e) =>
                                                    setClientFormData(
                                                        {
                                                            ...clientFormData,
                                                            nom: e
                                                                .target
                                                                .value
                                                        }
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">
                                                Téléphone
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                required
                                                value={
                                                    clientFormData.telephone
                                                }
                                                onChange={(e) =>
                                                    setClientFormData(
                                                        {
                                                            ...clientFormData,
                                                            telephone:
                                                                e
                                                                    .target
                                                                    .value
                                                        }
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold">
                                                Email
                                            </label>

                                            <input
                                                type="email"
                                                className="form-control rounded-3"
                                                value={
                                                    clientFormData.email
                                                }
                                                onChange={(e) =>
                                                    setClientFormData(
                                                        {
                                                            ...clientFormData,
                                                            email: e
                                                                .target
                                                                .value
                                                        }
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label small fw-bold">
                                                Adresse
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control rounded-3"
                                                value={
                                                    clientFormData.adresse
                                                }
                                                onChange={(e) =>
                                                    setClientFormData(
                                                        {
                                                            ...clientFormData,
                                                            adresse:
                                                                e
                                                                    .target
                                                                    .value
                                                        }
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer border-0 bg-light p-3">
                                    <button
                                        type="button"
                                        className="btn btn-link text-decoration-none text-muted fw-bold"
                                        onClick={() =>
                                            setIsClientModalOpen(
                                                false
                                            )
                                        }
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn text-white fw-bold rounded-pill px-4"
                                        style={{
                                            backgroundColor:
                                                theme.darkGreen
                                        }}
                                        disabled={
                                            savingClient
                                        }
                                    >
                                        {savingClient
                                            ? 'Chargement...'
                                            : editingClient
                                            ? 'Mettre à jour'
                                            : 'Confirmer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .rounded-4 {
                    border-radius: 1rem !important;
                }

                .form-control:focus {
                    box-shadow: none;
                    border-color: ${theme.orange};
                }

                .table-hover tbody tr:hover {
                    background-color: #f5f5f5;
                    transition: 0.2s;
                }

                .placeholder {
                    border-radius: 5px;
                }
            `}</style>
        </div>
    );

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
    }, [entreprise, logoUrl, loading]);

    // 2. SÉLECTION D'UN NOUVEAU LOGO
    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Libère la mémoire de l'ancien blob local s'il y en avait un
        if (logoPreview && logoPreview.startsWith('blob:')) {
            URL.revokeObjectURL(logoPreview);
        }

        const newUrl = URL.createObjectURL(file);
        setLogoFile(file);      // Stocke le fichier réel pour l'envoyer au serveur via FormData
        setLogoPreview(newUrl); // URL temporaire pour l'affichage <img src="..." />
        setIsBlobValid(true);
    };

    // 3. ENREGISTREMENT ET ENVOI AU BACKEND
    const handleSave = async () => {
        if (!info.nom.trim()) {
            onSave("Le nom de l'entreprise est obligatoire", 'danger');
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
            
            // On passe "logoFile" (qui contient le fichier ou null si inchangé) au contexte
            if (hasEntreprise) {
                await updateEntreprise(payload, logoFile);
                onSave('Entreprise et logo mis à jour avec succès !');
            } else {
                await createEntreprise(payload, logoFile);
                onSave('Entreprise créée avec succès !');
            }
            
            // On ne réinitialise logoFile qu'APRÈS le succès total de la requête réseau
            setLogoFile(null);
        } catch (error) {
            console.error("Erreur complète lors de la sauvegarde :", error);
            onSave(error.response?.data?.message || "Erreur lors de l'enregistrement", 'danger');
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
                            ? "Modifiez les informations affichées sur vos factures et dans l'application."
                            : "Créez votre entreprise pour personnaliser votre espace et vos documents."}
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
                    <div className="alert d-flex align-items-center gap-2 py-2 px-3 rounded-3 mb-0" 
                         style={{ backgroundColor: 'rgba(233, 114, 35, 0.1)', color: colors.orange, border: `1px dashed ${colors.orange}` }}>
                        <i className="bi bi-info-circle-fill"></i>
                        <small className="fst-italic">
                            Ces couleurs seront utilisées pour vos factures. Prenez le soin de bien sélectionner vos couleurs en fonction de celles de votre logo afin d'obtenir un design plus professionnel !
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
};

export default Profil;