import { useState } from "react";
import styles from "./CookieConsentBanner.module.css";

const STORAGE_KEY = "eman_cookie_consent";

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));

    const handleAccept = () => {
        localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ accepted: true, date: new Date().toISOString() })
        );
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className={styles.banner} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
        <p className={styles.text}>
            Al navegar por este sitio <strong>aceptás el uso de cookies</strong> para agilizar tu experiencia de compra.{" "}
            <a href="/privacy" className={styles.link}>
            Conocé más
            </a>
        </p>
        <button onClick={handleAccept} className={styles.button}>
            ENTENDIDO
        </button>
        </div>
    );
}