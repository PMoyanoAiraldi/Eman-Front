import { Link } from "react-router-dom";
import styles from "./Privacy.module.css";

const Privacy = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Inicio</Link>
                    <span> / </span>
                    <span>Privacidad</span>
                </nav>

                <h1 className={styles.title}>Política de privacidad</h1>

                <div className={styles.card}>
                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>¿Qué datos recolectamos?</h2>
                        <p>Al realizar una compra o contactarnos, podemos recolectar: nombre y apellido, dirección de email, localidad y datos de envío.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>¿Para qué los usamos?</h2>
                        <p>Para procesar tu pedido, coordinar el envío y contactarte ante cualquier novedad relacionada a tu compra.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Pagos</h2>
                        <p>Los pagos son procesados por MercadoPago. Eman no almacena ni tiene acceso a tus datos de tarjeta o cuenta bancaria.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Cookies</h2>
                        <p>Este sitio utiliza cookies estrictamente necesarias para mantener tu sesión activa. No utilizamos cookies de rastreo ni publicidad.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Tus datos</h2>
                        <p>No compartimos tu información personal con terceros salvo los necesarios para procesar tu pedido (Correo Argentino). Podés solicitar la eliminación de tus datos escribiéndonos por{" "}
                            <a
                                href="https://wa.me/5493404535333"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                WhatsApp
                            </a>.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Legislación aplicable</h2>
                        <p>Esta política se rige por la Ley 25.326 de Protección de Datos Personales de la República Argentina.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;