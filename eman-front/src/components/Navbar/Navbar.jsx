import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openCart, selectCartCount } from '../../redux/slices/cartReducer'
import { logoutUser } from '../../redux/slices/authReducer'
import { authService } from '../../api/authService'
import { Link, useNavigate} from 'react-router-dom'
import { ShoppingBag, User,  Menu, X  } from 'lucide-react'
import styles from './Navbar.module.css'
import emanLogo from '../../assets/eman-logo.png'

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const cartCount = useSelector(selectCartCount)
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
    const user = useSelector(state => state.auth.user)

    const [scrolled, setScrolled] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const dropdownRef = useRef(null)
    
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

     // Cierra el dropdown si el usuario hace click fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Escape cierra menú y dropdown
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') {
                setMenuOpen(false)
                setDropdownOpen(false)
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    const closeMenu = () => setMenuOpen(false)

    const handleUserClick = () => {
        closeMenu()
        if (!isAuthenticated) {
            navigate('/login')
        } else {
            setDropdownOpen(prev => !prev)
        }
    }

    const handleCartClick = () => {
        closeMenu()
        dispatch(openCart())
    }

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch {
            // Si falla el endpoint igual limpiamos el estado local
        } finally {
            dispatch(logoutUser())
            setDropdownOpen(false)
            navigate('/')
        }
    }

    const goTo = (path) => {
        navigate(path)
        setDropdownOpen(false)
    }

    // Muestra solo el primer nombre
    const firstName = user?.name?.split(' ')[0] || ''

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <button
                    className={styles.menuBtn}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                    aria-controls="nav-links"
                    onClick={() => setMenuOpen(prev => !prev)}
                >
                    {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>


            <Link to="/" className={styles.logo} onClick={closeMenu}>
                <img src={emanLogo} alt="Eman" className={styles.logoImg} />
            </Link>

            <ul id="nav-links" className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`} onClick={closeMenu}>
                <li><Link to="/mujer">Mujer</Link></li>
                <li><Link to="/hombre">Hombre</Link></li>
                <li><Link to="/deportivo">Deportivo</Link></li>
                <li><Link to="/tienda">Tienda</Link></li>
            </ul>

            <div className={styles.icons}>
            <div className={styles.userWrapper} ref={dropdownRef}>
                <button className={styles.iconBtn} aria-label="Mi cuenta" onClick={handleUserClick}>
                    <User size={18} strokeWidth={1.5} />
                    {isAuthenticated && (
                        <span className={styles.userName}>{firstName}</span>
                    )}
                </button>

            {dropdownOpen && (
                <div className={styles.dropdown}>
                    <button
                        className={styles.dropdownItem}
                        onClick={() => goTo ('/perfil')}
                    >
                        Mi perfil
                    </button>

                    {user?.rol === 'admin' && (
                        <button
                            className={styles.dropdownItem}
                            onClick={() => goTo ('/admin')}
                        >
                            Panel admin
                        </button>
                    )}
                    {user?.rol === 'developer' && (
                        <button
                            className={styles.dropdownItem}
                            onClick={() => goTo ('/admin')}
                        >
                            Panel dev
                        </button>
                    )}

                    {(user?.rol === 'cliente' || !user?.rol) && (
                        <button
                            className={styles.dropdownItem}
                            onClick={() => goTo ('/mis-compras')}
                        >
                            Mis compras
                        </button>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button
                        className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                            onClick={handleLogout}
                        >
                        Cerrar sesión
                    </button>
                </div>
                )}
                </div>  

                <button className={styles.iconBtn} aria-label="Carrito" onClick={handleCartClick}>
                    <ShoppingBag size={18} strokeWidth={1.5} />
                    {cartCount > 0 && (
                        <span className={styles.cartBadge}>{cartCount}</span>
                    )}
                </button>
            </div>
        </nav>
    )
}

export default Navbar