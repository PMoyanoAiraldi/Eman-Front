import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import styles from "./Shipping.module.css";

const Shipping = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Inicio</Link>
                    <span> / </span>
                    <span>Envíos</span>
                </nav>

                <h1 className={styles.title}>Envíos</h1>

                <div className={styles.card}>
                <section className={styles.section}>
                    <h2 className={styles.subtitle}>Correo Argentino</h2>
                    <p>Realizamos envíos a todo el país. El costo se calcula automáticamente en el checkout según tu localidad. El tiempo estimado de entrega es de 3 a 7 días hábiles desde el despacho.</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.subtitle}>Envío coordinado — Belgrano y Gálvez</h2>
                    <p>Sin costo. Coordinamos el día y horario de entrega por WhatsApp. Tiempo estimado: 2 a 3 días hábiles.</p>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.subtitle}>Retiro en tienda</h2>
                    <p>Sin costo. Te avisamos por WhatsApp cuando tu pedido está listo para retirar.</p>
                    <a
                    href="https://maps.google.com/?q=Entre+Rios+1529+López+Santa+Fe"
                    target="_blank"
                    rel="noopener noreferrer" className={styles.address}><MapPin size={14} color="var(--color-gold)" /> Entre Ríos 1529</a>
                </section>
                </div>
            </div>
        </div>
    );
};

export default Shipping;