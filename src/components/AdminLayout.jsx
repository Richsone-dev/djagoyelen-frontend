import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import adminApi from '../api/adminAxios';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
    };

    const links = [
        { path: '/admin/dashboard', label: 'Tableau de bord', icon: 'speedometer2' },
        { path: '/admin/users', label: 'Utilisateurs', icon: 'people' },
    ];

    const handleLogout = async () => {
        try {
            await adminApi.post('/logout');
        } catch {
            // ignore
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            navigate('/admin/login', { replace: true });
        }
    };

    return (
        <div className="min-vh-100 d-flex" style={{ backgroundColor: '#f4f6f8' }}>
            <aside
                className="text-white d-flex flex-column shadow"
                style={{
                    width: 260,
                    minHeight: '100vh',
                    backgroundColor: colors.darkGreen,
                    position: 'sticky',
                    top: 0,
                }}
            >
                <div className="p-4 border-bottom border-secondary border-opacity-25">
                    <h5 className="mb-0 fw-bold">
                        <i className="bi bi-shield-lock me-2" style={{ color: colors.orange }} />
                        DjagoYelen Admin
                    </h5>
                    <small className="text-white-50">{adminUser?.name || 'Administrateur'}</small>
                </div>

                <nav className="flex-grow-1 p-3">
                    {links.map((link) => {
                        const active = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded mb-1 ${
                                    active ? 'bg-white text-dark fw-semibold' : 'text-white-50'
                                }`}
                            >
                                <i className={`bi bi-${link.icon}`} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-top border-secondary border-opacity-25">
                    <Link
                        to="/dashboard"
                        className="btn btn-sm btn-outline-light w-100 mb-2"
                        onClick={() => {
                            const userToken = localStorage.getItem('token');
                            if (!userToken) {
                                localStorage.setItem('token', localStorage.getItem('admin_token'));
                                localStorage.setItem('user', localStorage.getItem('admin_user'));
                            }
                        }}
                    >
                        <i className="bi bi-box-arrow-up-right me-1" />
                        App utilisateur
                    </Link>
                    <button
                        type="button"
                        className="btn btn-sm w-100 text-white"
                        style={{ backgroundColor: colors.orange }}
                        onClick={handleLogout}
                    >
                        <i className="bi bi-box-arrow-right me-1" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            <main className="flex-grow-1 p-4 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
