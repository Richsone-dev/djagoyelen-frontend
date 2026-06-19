import { useState } from 'react';
import Swal from 'sweetalert2';
import {
    useNotifications,
    getNotificationIcon,
    formatNotificationDate,
    dispatchNotificationsUpdated,
} from '../hooks/useNotifications';

const Notifications = () => {
    const [filter, setFilter] = useState('all');
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
    } = useNotifications({ limit: 100, pollInterval: 90000 });

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
    };

    const filtered =
        filter === 'unread'
            ? notifications.filter((n) => !n.is_read)
            : notifications;

    // Détermine si c'est le tout premier chargement à blanc
    const isInitialLoading = loading && notifications.length === 0;

    const handleDelete = async (notif) => {
        const result = await Swal.fire({
            title: 'Supprimer cette notification ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler',
        });

        if (result.isConfirmed) {
            await removeNotification(notif.id);
            dispatchNotificationsUpdated();
        }
    };

    return (
        <div className="pb-4">
            {/* Header */}
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h3 className="fw-bold mb-1" style={{ color: colors.successGreen }}>
                        <i className="bi bi-bell me-2" />
                        Notifications
                    </h3>
                    <p className="text-muted mb-0">
                        {unreadCount > 0
                            ? `${unreadCount} non lue(s) sur ${notifications.length}`
                            : `${notifications.length} notification(s)`}
                    </p>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    <div className="btn-group btn-group-sm">
                        <button
                            type="button"
                            className={`btn ${filter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setFilter('all')}
                        >
                            Toutes
                        </button>
                        <button
                            type="button"
                            className={`btn ${filter === 'unread' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setFilter('unread')}
                        >
                            Non lues
                            {unreadCount > 0 && (
                                <span className="badge bg-danger ms-1">{unreadCount}</span>
                            )}
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={markAllAsRead}
                        >
                            <i className="bi bi-check2-all me-1" />
                            Tout marquer comme lu
                        </button>
                    )}

                    {/* Bouton Refresh avec spinner intégré si chargement en arrière-plan */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={fetchNotifications}
                        disabled={loading}
                    >
                        <i className={`bi bi-arrow-clockwise ${loading ? 'spin-animation d-inline-block' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Zone de contenu principale */}
            {isInitialLoading ? (
                /* Écrans de chargement initial (Skeletons factices pour un rendu plus pro) */
                <div className="d-flex flex-column gap-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="card border-0 shadow-sm placeholder-glow">
                            <div className="card-body d-flex gap-3 align-items-start">
                                <div className="rounded-circle bg-secondary placeholder" style={{ width: 44, height: 44, opacity: 0.15 }} />
                                <div className="flex-grow-1">
                                    <div className="placeholder col-4 mb-2" style={{ height: '15px' }} />
                                    <div className="placeholder col-8 d-block" style={{ height: '12px' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                /* Liste vide */
                <div className="card border-0 shadow-sm text-center py-5">
                    <i className="bi bi-bell-slash display-4 text-muted mb-3 d-block" />
                    <h5 className="text-muted">
                        {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                    </h5>
                    <p className="text-muted small mb-0">
                        Les alertes budget et messages système apparaîtront ici.
                    </p>
                </div>
            ) : (
                /* Liste des notifications */
                <div className={`d-flex flex-column gap-2 ${loading ? 'opacity-75' : ''}`} style={{ transition: 'opacity 0.2s' }}>
                    {filtered.map((notif) => {
                        const { icon, className } = getNotificationIcon(notif.type);
                        return (
                            <div
                                key={notif.id}
                                className={`card border-0 shadow-sm ${
                                    !notif.is_read ? 'border-start border-4 border-warning' : ''
                                }`}
                            >
                                <div className="card-body d-flex gap-3 align-items-start">
                                    <div
                                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: 'rgba(25, 135, 84, 0.1)',
                                        }}
                                    >
                                        <i className={`bi ${icon} fs-5 ${className}`} />
                                    </div>

                                    <div className="flex-grow-1 min-w-0">
                                        <div className="d-flex flex-wrap justify-content-between gap-2">
                                            <h6 className={`mb-1 ${!notif.is_read ? 'fw-bold' : ''}`}>
                                                {notif.title || 'Information'}
                                                {!notif.is_read && (
                                                    <span className="badge bg-warning text-dark ms-2 small">
                                                        Nouveau
                                                    </span>
                                                )}
                                            </h6>
                                            <small className="text-muted">
                                                {formatNotificationDate(notif.created_at)}
                                            </small>
                                        </div>
                                        <p className="text-muted mb-2 mb-md-1">{notif.message}</p>

                                        <div className="d-flex flex-wrap gap-2">
                                            {!notif.is_read && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => markAsRead(notif.id)}
                                                >
                                                    <i className="bi bi-check2 me-1" />
                                                    Marquer lu
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(notif)}
                                            >
                                                <i className="bi bi-trash" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Notifications;