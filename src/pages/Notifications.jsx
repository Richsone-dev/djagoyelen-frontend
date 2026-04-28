import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // Sécurité : Vérifie si useTheme existe pour éviter la page blanche
    const themeContext = useTheme();
    const theme = themeContext ? themeContext.theme : 'light';

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        white: '#ffffff',
        lightGray: '#f8f9fa'
    };

    const fetchNotificationsData = useCallback(async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ]);

            if (listRes.data && Array.isArray(listRes.data)) {
                setNotifications(listRes.data);
            }
            
            // Sécurité sur le count
            if (countRes.data && typeof countRes.data.count !== 'undefined') {
                setUnreadCount(countRes.data.count);
            }
        } catch (error) {
            console.error("Erreur notifications:", error);
        }
    }, []);

    useEffect(() => {
        fetchNotificationsData();
        const interval = setInterval(fetchNotificationsData, 60000);
        return () => clearInterval(interval);
    }, [fetchNotificationsData]);

    // ... garder markAsRead et markAllAsRead identiques ...

    return (
        <div className="dropdown">
            <button 
                className="btn position-relative p-1 border-0" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                type="button"
                id="notificationsDropdown"
            >
                <i className="bi bi-bell fs-4" style={{ color: colors.white }}></i>
                {unreadCount > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger"
                        style={{ 
                            fontSize: '0.65rem', 
                            minWidth: '18px', 
                            height: '18px', 
                            padding: '4px',
                            border: `2px solid ${colors.darkGreen}`,
                            zIndex: 1050
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 p-0" aria-labelledby="notificationsDropdown" style={{ width: '320px', borderRadius: '12px', overflow: 'hidden' }}>
                <li className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: colors.lightGray }}>
                    <h6 className="mb-0 fw-bold" style={{ color: colors.darkGreen }}>Notifications</h6>
                    {unreadCount > 0 && (
                        <button 
                            className="btn btn-link p-0 text-decoration-none small fw-bold" 
                            style={{ fontSize: '0.75rem', color: colors.orange }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markAllAsRead(e);
                            }}
                        >
                            Tout marquer lu
                        </button>
                    )}
                </li>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {/* Vérification si notifications est bien un tableau avant le .map */}
                    {Array.isArray(notifications) && notifications.length === 0 ? (
                        <li className="p-4 text-center text-muted">
                            <i className="bi bi-check2-circle fs-2 d-block mb-2" style={{ color: '#ccc' }}></i>
                            <span className="small">Aucune notification</span>
                        </li>
                    ) : (
                        notifications.map(notif => (
                            <li 
                                key={notif.id} 
                                className={`dropdown-item p-3 border-bottom text-wrap ${!notif.is_read ? 'bg-light' : ''}`} 
                                style={{ 
                                    transition: '0.3s', 
                                    cursor: 'pointer',
                                    borderLeft: !notif.is_read ? `4px solid ${colors.orange}` : '4px solid transparent',
                                    whiteSpace: 'normal'
                                }}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                            >
                                <div className="d-flex align-items-start">
                                    <div className="me-2 mt-1">
                                        <i className={`bi ${notif.type === 'danger' ? 'bi-exclamation-octagon-fill text-danger' : 'bi-info-circle-fill text-primary'}`}></i>
                                    </div>
                                    <div className="w-100">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <p className={`mb-0 small ${!notif.is_read ? 'fw-bold' : ''} text-dark`}>
                                                {notif.title || "Information"}
                                            </p>
                                        </div>
                                        <p className="mb-1 text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </div>

                <li className="text-center p-2 border-top" style={{ backgroundColor: colors.lightGray }}>
                    <Link to="/notifications" className="text-decoration-none small fw-bold" style={{ color: colors.darkGreen, fontSize: '0.75rem' }}>
                        Voir tout l'historique
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Notifications;