import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./CookieConsentBanner.module.css";

const STORAGE_KEY = "eman_cookie_consent";

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
    const bannerRef = useRef(null);

     // Publica el alto del banner para que el botón de WhatsApp quede por encima
    useEffect(() => {
        if (!visible || !bannerRef.current) return;
        const el = bannerRef.current;
        const publish = () =>
            document.documentElement.style.setProperty("--banner-offset", `${el.offsetHeight}px`);
        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        return () => {
            observer.disconnect();
            document.documentElement.style.removeProperty("--banner-offset");
        };
    }, [visible]);

    const handleAccept = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ accepted: true, date: new Date().toISOString() })
            );
            setVisible(false);
        };

    if (!visible) return null;

    return (
        <div ref={bannerRef} className={styles.banner} role="dialog" aria-live="polite" aria-label="Aviso de cookies">
        <p className={styles.text}>
            Al navegar por este sitio <strong>aceptás el uso de cookies</strong> para agilizar tu experiencia de compra.{" "}
            <Link to="/privacy" className={styles.link}>
                    Conocé más
            </Link>
        </p>
        <button onClick={handleAccept} className={styles.button}>
            ENTENDIDO
        </button>
        </div>
    );
}