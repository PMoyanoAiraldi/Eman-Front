import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Package, ShoppingBag, Users, LogOut, Menu } from 'lucide-react'
import { logoutUser } from '../../redux/slices/authReducer'
import { authService } from '../../api/authService'
import { ExternalLink } from 'lucide-react'
import styles from './AdminLayout.module.css'

const navItems = [
    { to: '/admin/products', icon: Package, label: 'Productos' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Órdenes' },
    { to: '/admin/users', icon: Users, label: 'Usuarios' },
]

const AdminLayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.user)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch {
            // limpiamos igual
        } finally {
            dispatch(logoutUser())
            navigate('/')
        }
    }

    return (
        <div className={styles.layout}>
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <span className={styles.sidebarLogo}>EMAN</span>
                    <span className={styles.sidebarSub}>Panel de administración</span>
                </div>

                <nav className={styles.nav}>
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={18} strokeWidth={1.5} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <a   href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.siteLink}
                    >
                        <ExternalLink size={16} strokeWidth={1.5} />
                        Ver sitio
                    </a>

                    <p className={styles.footerName}>{user?.name?.split(' ')[0]}</p>
                    <button className={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={16} strokeWidth={1.5} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className={styles.main}>
                {/* Header mobile */}
                <header className={styles.mobileHeader}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={22} strokeWidth={1.5} />
                    </button>
                    <span className={styles.mobileTitle}>EMAN Admin</span>
                    <div /> {/* spacer */}
                </header>

                <div className={styles.content}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminLayout