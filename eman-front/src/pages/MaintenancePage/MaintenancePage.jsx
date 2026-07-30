import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MaintenancePage.module.css';
import emanLogo from '../../assets/eman-logo.png'

const MaintenancePage = () => {
    const navigate = useNavigate();
    const clickCount = useRef(0);
    const clickTimer = useRef(null);

    const handleLogoClick = () => {
        clickCount.current += 1;

        if (clickCount.current === 1) {
            clickTimer.current = setTimeout(() => {
                clickCount.current = 0;
            }, 800); // ventana de 800ms entre clicks
        }

        if (clickCount.current === 3) {
            clearTimeout(clickTimer.current);
            clickCount.current = 0;
            navigate('/login');
        }
    };


    return (
        <div className={styles.wrapper}>
        <div className={styles.logo}>
            <img src={emanLogo} alt="Eman" className={styles.logoImg} onClick={handleLogoClick} />
        </div>

        <h1 className={styles.title}>Estamos trabajando para brindarte una mejor experiencia</h1>
        <p className={styles.subtitle}>Volvemos en breve. Gracias por tu paciencia. ✨</p>

        <span className={styles.divider} />
        </div>
    );
};

export default MaintenancePage;