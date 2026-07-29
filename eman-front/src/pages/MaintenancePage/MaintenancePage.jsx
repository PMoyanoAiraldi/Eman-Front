import styles from './MaintenancePage.module.css';

const MaintenancePage = () => {
    return (
        <div className={styles.wrapper}>
        <svg
            className={styles.branch}
            viewBox="0 0 200 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            className={styles.branchLine}
            d="M20 100 C 60 90, 90 70, 130 40 C 145 28, 160 20, 180 15"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeLinecap="round"
            />
            <ellipse className={styles.leaf} cx="70" cy="78" rx="14" ry="8" fill="#C9A84C" transform="rotate(-25 70 78)" />
            <ellipse className={styles.leaf} cx="115" cy="52" rx="14" ry="8" fill="#C9A84C" transform="rotate(-20 115 52)" />
            <ellipse className={styles.leaf} cx="160" cy="28" rx="13" ry="7" fill="#C9A84C" transform="rotate(-15 160 28)" />
        </svg>

        <h1 className={styles.title}>Estamos trabajando para brindarte una mejor experiencia</h1>
        <p className={styles.subtitle}>Volvemos en breve. Gracias por tu paciencia. ✨</p>

        <span className={styles.divider} />

        <a href="/login" className={styles.adminAccess} aria-label="Acceso">•</a>
        </div>
    );
};

export default MaintenancePage;