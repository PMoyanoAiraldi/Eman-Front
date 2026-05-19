import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import { Instagram } from 'lucide-react'

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
        <div className={styles.main}>

            <nav className={styles.links}>
                <Link to="/nosotros">Nosotros</Link>
                <Link to="/contacto">Contacto</Link>
                <Link to="/envios">Envíos</Link>
                <Link to="/devoluciones">Devoluciones</Link>
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
            <span>© {currentYear} eman. todos los derechos reservados.</span>
            <div className={styles.legal}>
                <Link to="/privacidad">privacidad</Link>
                <Link to="/terminos">términos</Link>
            </div>
        </div>
        </footer>
    )
}

export default Footer