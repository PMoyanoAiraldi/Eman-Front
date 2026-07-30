import styles from './MaintenancePage.module.css';
import emanLogo from '../../assets/eman-logo.png'

const MaintenancePage = () => {
    return (
        <div className={styles.wrapper}>
        <div className={styles.logo}>
            <img src={emanLogo} alt="Eman" className={styles.logoImg} />
        </div>

        <h1 className={styles.title}>Estamos trabajando para brindarte una mejor experiencia</h1>
        <p className={styles.subtitle}>Volvemos en breve. Gracias por tu paciencia. ✨</p>

        <span className={styles.divider} />

        <a href="/login" className={styles.adminAccess} aria-label="Acceso">•</a>
        </div>
    );
};

export default MaintenancePage;