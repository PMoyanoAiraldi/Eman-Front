import { Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import styles from "../../styles/InfoPage.module.css";

const Returns = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Breadcrumb items={[
                    { label: 'Inicio', path: '/' }, 
                    { label: 'Devoluciones' }]} 
                />

                <h1 className={styles.title}>Devoluciones y cambios</h1>

                <div className={styles.card}>
                    <section className={styles.section}>
                    <h2 className={styles.subtitle}>Derecho de arrepentimiento</h2>
                        <p>
                            Según la Ley 24.240, tenés 10 días corridos desde que recibís tu pedido para arrepentirte de tu compra, sin necesidad de dar ningún motivo y sin costo. Para hacerlo usá el{" "}
                            <Link to="/arrepentimiento" className={styles.link}>botón de arrepentimiento</Link>
                            . No hace falta tener cuenta. Te enviamos por email un código que identifica tu solicitud dentro de las 24 horas.
                        </p>
                        <p>
                            El costo del envío de devolución está a cargo de Eman. La prenda debe devolverse en el mismo estado en que la recibiste, con sus etiquetas y embalaje. Te reintegramos el importe abonado por el mismo medio de pago que utilizaste.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Cambio de talle o color</h2>
                        <p>
                            Tenés 15 días corridos desde la recepción de tu pedido para solicitar un cambio, sujeto a disponibilidad de stock. La prenda debe estar sin uso, con sus etiquetas originales y en su embalaje. El costo del envío de devolución está a cargo del cliente.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Prendas defectuosas</h2>
                        <p>
                            Si recibís una prenda con defecto de fábrica, nos hacemos cargo del envío de devolución y te damos una solución conforme a la garantía legal de la Ley 24.240.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>¿Cómo iniciar un cambio o reclamo por defecto?</h2>
                        <p>
                            Escribinos por{" "}
                            <a
                                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
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