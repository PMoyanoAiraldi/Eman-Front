import { Link } from 'react-router-dom'
import styles from './Footer.module.css'


const InstagramIcon = ({ size = 18 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
)

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
        <div className={styles.main}>

            <nav className={styles.links}>
                <Link to="/nosotros">Nosotros</Link>
                <Link to="/contact">Contacto</Link>
                <Link to="/shipping">Envíos</Link>
                <Link to="/returns">Devoluciones</Link>
            </nav>

            <a  
                href="https://instagram.com/eman_acces"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.instagram}
                aria-label="Instagram de Eman"
            >
            <InstagramIcon size={18} strokeWidth={1.5} />
            </a>
            </div>

        <div className={styles.bottom}>
            <span>© {currentYear} Eman. Todos los derechos reservados.</span>
            <div className={styles.legal}>
                <Link to="/privacy">Privacidad</Link>
                <Link to="/terms">Términos</Link>
            </div>
        </div>
        </footer>
    )
}

export default Footer