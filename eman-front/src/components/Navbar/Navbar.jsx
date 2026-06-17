import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { openCart, selectCartCount } from '../../redux/slices/cartReducer'
import { logoutUser } from '../../redux/slices/authReducer'
import { authService } from '../../api/authService'
import { Link, useNavigate} from 'react-router-dom'
import { ShoppingBag, User } from 'lucide-react'
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

    const handleUserClick = () => {
        if (!isAuthenticated) {
            navigate('/login')
        } else {
            setDropdownOpen(prev => !prev)
        }
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

    // Muestra solo el primer nombre
    const firstName = user?.name?.split(' ')[0] || ''

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <Link to="/" className={styles.logo}>
                <img src={emanLogo} alt="Eman" className={styles.logoImg} />
            </Link>

            <ul className={styles.links}>
                <li><Link to="/mujer">Mujer</Link></li>
                <li><Link to="/hombre">Hombre</Link></li>
                <li><Link to="/deportivo">Deportivo</Link></li>
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
                        onClick={() => { navigate('/perfil'); setDropdownOpen(false) }}
                    >
                        Mi perfil
                    </button>
                    <button
                        className={styles.dropdownItem}
                        onClick={() => { navigate('/mis-compras'); setDropdownOpen(false) }}
                    >
                        Mis compras
                    </button>
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

                <button className={styles.iconBtn} aria-label="Carrito" onClick={() => dispatch(openCart())}>
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