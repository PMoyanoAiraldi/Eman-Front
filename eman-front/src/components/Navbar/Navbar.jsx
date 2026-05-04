import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, User } from 'lucide-react'
import styles from './Navbar.module.css'
import emanLogo from '../../assets/eman-logo.png'

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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
                <button className={styles.iconBtn} aria-label="Mi cuenta">
                    <User size={18} strokeWidth={1.5} />
                </button>
                <button className={styles.iconBtn} aria-label="Favoritos">
                    <Heart size={18} strokeWidth={1.5} />
                </button>
                <button className={styles.iconBtn} aria-label="Carrito">
                    <ShoppingBag size={18} strokeWidth={1.5} />
                </button>
            </div>
        </nav>
    )
}

export default Navbar