import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { Instagram } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
        <div className={styles.main}>

        <div /> {/* ← spacer vacío para balancear */}

            <nav className={styles.links}>
                <Link to="/nosotros">Nosotros</Link>
                <Link to="/contact">Contacto</Link>
                <Link to="/shipping">Envíos</Link>
                <Link to="/returns">Devoluciones</Link>
            </nav>

            <a   href="https://instagram.com/eman_acces"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.instagram}
                    >
            <Instagram size={16} strokeWidth={1.5} />
            </a>
            </div>

        <div className={styles.bottom}>
            <span>© {currentYear} Eman. Todos los derechos reservados.</span>
            <div className={styles.legal}>
                <Link to="/privacidad">Privacidad</Link>
                <Link to="/terminos">Términos</Link>
            </div>
        </div>
        </footer>
    )
}

export default Footer