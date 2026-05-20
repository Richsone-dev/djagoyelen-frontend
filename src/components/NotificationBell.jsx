import { Link } from 'react-router-dom';
import { useNotifications, getNotificationIcon, formatNotificationDate } from '../hooks/useNotifications';

const NotificationBell = ({ variant = 'header' }) => {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
    } = useNotifications({ limit: 8, pollInterval: 45000 });

    const isHeader = variant === 'header';
    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        white: '#ffffff',
        lightGray: '#f8f9fa',
    };

    const preview = notifications.slice(0, 6);

    return (
        <div className="dropdown">
            <button
                type="button"
                className={`btn position-relative border-0 ${
                    isHeader ? 'p-1 me-2 me-md-3' : 'p-2'
                }`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
                id="notificationsDropdown"
                style={{
                    minWidth: isHeader ? 40 : 44,
                    minHeight: isHeader ? 40 : 44,
                }}
            >
                <i
                    className={`bi bi-bell${unreadCount > 0 ? '-fill' : ''} ${
                        isHeader ? 'fs-5' : 'fs-4'
                    }`}
                    style={{ color: isHeader ? colors.white : colors.darkGreen }}
                />
                {unreadCount > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{
                            fontSize: '0.65rem',
                            minWidth: 18,
                            padding: '3px 5px',
                            border: isHeader ? `2px solid ${colors.darkGreen}` : 'none',
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <ul
                className="dropdown-menu dropdown-menu-end shadow-lg border-0 p-0 mt-2"
                aria-labelledby="notificationsDropdown"
                style={{
                    width: 'min(340px, calc(100vw - 24px))',
                    maxWidth: '340px',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}
            >
                <li
                    className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center"
                    style={{ backgroundColor: colors.lightGray }}
                >
                    <span className="fw-bold small" style={{ color: colors.darkGreen }}>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="badge bg-danger ms-2">{unreadCount}</span>
                        )}
                    </span>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none small fw-bold"
                            style={{ color: colors.orange, fontSize: '0.75rem' }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead();
                            }}
                        >
                            Tout lire
                        </button>
                    )}
                </li>

                <div style={{ maxHeight: 'min(360px, 50vh)', overflowY: 'auto' }}>
                    {preview.length === 0 ? (
                        <li className="px-3 py-4 text-center text-muted small">
                            <i className="bi bi-check2-circle fs-3 d-block mb-2 opacity-50" />
                            Aucune notification
                        </li>
                    ) : (
                        preview.map((notif) => {
                            const { icon, className } = getNotificationIcon(notif.type);
                            return (
                                <li key={notif.id}>
                                    <button
                                        type="button"
                                        className={`dropdown-item py-3 border-bottom text-start w-100 ${
                                            !notif.is_read ? 'bg-light' : ''
                                        }`}
                                        style={{
                                            whiteSpace: 'normal',
                                            borderLeft: !notif.is_read
                                                ? `4px solid ${colors.orange}`
                                                : '4px solid transparent',
                                        }}
                                        onClick={() => {
                                            if (!notif.is_read) markAsRead(notif.id);
                                        }}
                                    >
                                        <div className="d-flex gap-2">
                                            <i className={`bi ${icon} ${className} mt-1`} />
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between gap-2">
                                                    <span
                                                        className={`small ${
                                                            !notif.is_read ? 'fw-bold' : ''
                                                        }`}
                                                    >
                                                        {notif.title || 'Information'}
                                                    </span>
                                                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                        {formatNotificationDate(notif.created_at)}
                                                    </span>
                                                </div>
                                                <p
                                                    className="mb-0 text-muted"
                                                    style={{ fontSize: '0.8rem', lineHeight: 1.3 }}
                                                >
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })
                    )}
                </div>

                <li
                    className="text-center py-2 border-top"
                    style={{ backgroundColor: colors.lightGray }}
                >
                    <Link
                        to="/notifications"
                        className="text-decoration-none small fw-bold"
                        style={{ color: colors.darkGreen }}
                        onClick={() => {
                            document.querySelector('[data-bs-toggle="dropdown"][aria-expanded="true"]')?.click();
                        }}
                    >
                        Voir toutes les notifications
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default NotificationBell;
