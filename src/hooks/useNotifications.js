import { useCallback, useEffect, useState, useRef } from 'react';
import api from '../api/axios';

export const NOTIFICATIONS_UPDATED = 'notifications-updated';

export const dispatchNotificationsUpdated = () => {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED));
};

const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'default') {
        try {
            await Notification.requestPermission();
        } catch (error) {
            console.warn('Permission notification refusée ou impossible', error);
        }
    }
};

const showBrowserNotification = (notification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
        new Notification(notification.title || 'DjagoYelen', {
            body: notification.message || '',
            icon: '/src/assets/djago-logo.jpeg',
            tag: `djagoyelen-notification-${notification.id}`,
            renotify: true,
            data: {
                id: notification.id,
            },
        });
    } catch (error) {
        console.warn('Impossible d’afficher la notification système', error);
    }
};

export function useNotifications({
    autoRefresh = true,
    pollInterval = 60000,
    instant = false,
    limit = 20,
} = {}) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const seenIdsRef = useRef(new Set());
    const latestIdRef = useRef(0);
    const initializedRef = useRef(false);

    const notifyNewItems = useCallback((items) => {
        if (!initializedRef.current) return;

        items
            .filter((notification) => !seenIdsRef.current.has(notification.id) && !notification.is_read)
            .forEach(showBrowserNotification);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications', { params: { limit } }),
                api.get('/notifications/unread-count'),
            ]);

            const fetchedNotifications = Array.isArray(listRes.data) ? listRes.data : [];
            notifyNewItems(fetchedNotifications);
            setNotifications(fetchedNotifications);
            setUnreadCount(countRes.data?.count ?? 0);

            seenIdsRef.current = new Set(fetchedNotifications.map((n) => n.id));
            latestIdRef.current = fetchedNotifications.reduce(
                (max, notification) => Math.max(max, notification.id),
                latestIdRef.current
            );
            initializedRef.current = true;
        } catch (error) {
            console.error('Erreur notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [limit, notifyNewItems]);

    const pollSince = useCallback(async () => {
        try {
            const response = await api.get('/notifications/since', {
                params: { since_id: latestIdRef.current },
            });

            const incoming = response.data?.notifications || [];
            const latestId = response.data?.latest_id ?? latestIdRef.current;

            if (incoming.length > 0) {
                notifyNewItems(incoming);
                setNotifications((prev) => {
                    const merged = [...incoming, ...prev];
                    const unique = [];
                    const ids = new Set();
                    merged.forEach((item) => {
                        if (!ids.has(item.id)) {
                            ids.add(item.id);
                            unique.push(item);
                        }
                    });
                    return unique.slice(0, limit);
                });
                incoming.forEach((item) => seenIdsRef.current.add(item.id));
                dispatchNotificationsUpdated();
            }

            latestIdRef.current = Math.max(latestIdRef.current, latestId);

            const countRes = await api.get('/notifications/unread-count');
            setUnreadCount(countRes.data?.count ?? 0);
            initializedRef.current = true;
        } catch (error) {
            console.error('Erreur polling notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [limit, notifyNewItems]);

    useEffect(() => {
        requestBrowserPermission();

        const bootstrap = async () => {
            await fetchNotifications();
            if (instant) {
                await pollSince();
            }
        };

        bootstrap();

        if (!autoRefresh) return undefined;

        const refresh = instant ? pollSince : fetchNotifications;
        const interval = setInterval(refresh, pollInterval);
        const onUpdate = () => refresh();
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };

        window.addEventListener(NOTIFICATIONS_UPDATED, onUpdate);
        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(interval);
            window.removeEventListener(NOTIFICATIONS_UPDATED, onUpdate);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [fetchNotifications, pollSince, autoRefresh, pollInterval, instant]);

    const markAsRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        dispatchNotificationsUpdated();
    };

    const markAllAsRead = async () => {
        await api.put('/notifications/read-all');
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        dispatchNotificationsUpdated();
    };

    const removeNotification = async (id) => {
        await api.delete(`/notifications/${id}`);
        setNotifications((prev) => {
            const removed = prev.find((n) => n.id === id);
            if (removed && !removed.is_read) {
                setUnreadCount((c) => Math.max(0, c - 1));
            }
            return prev.filter((n) => n.id !== id);
        });
        dispatchNotificationsUpdated();
    };

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        removeNotification,
    };
}

export const getNotificationIcon = (type) => {
    switch (type) {
        case 'danger':
            return { icon: 'bi-exclamation-octagon-fill', className: 'text-danger' };
        case 'warning':
            return { icon: 'bi-exclamation-triangle-fill', className: 'text-warning' };
        case 'success':
            return { icon: 'bi-check-circle-fill', className: 'text-success' };
        default:
            return { icon: 'bi-info-circle-fill', className: 'text-primary' };
    }
};

export const formatNotificationDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)} h`;
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};
