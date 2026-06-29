import { Link } from "react-router-dom";
import styles from "./Returns.module.css";

const Returns = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Inicio</Link>
                    <span> / </span>
                    <span>Devoluciones</span>
                </nav>

                <h1 className={styles.title}>Devoluciones y cambios</h1>

                <div className={styles.card}>
                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Plazo</h2>
                        <p>Tenés 15 días corridos desde la recepción de tu pedido para solicitar un cambio o devolución.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Condiciones</h2>
                        <p>La prenda debe estar sin uso, con sus etiquetas originales y en su embalaje.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Cambio de talle o color</h2>
                        <p>El costo del envío de devolución está a cargo del cliente.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Prendas defectuosas</h2>
                        <p>Si recibís una prenda con defecto de fábrica, nos hacemos cargo del envío de devolución.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>¿Cómo iniciarlo?</h2>
                        <p>
                            Escribinos por{" "}
                            <a
                                href="https://wa.me/5493404535333"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                WhatsApp
                            </a>
                            {" "}indicando tu número de pedido y el motivo.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Returns;