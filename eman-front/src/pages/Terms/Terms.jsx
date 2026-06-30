import { Link } from "react-router-dom";
import styles from "./Terms.module.css";

const Terms = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <nav className={styles.breadcrumb}>
                    <Link to="/">Inicio</Link>
                    <span> / </span>
                    <span>Términos y condiciones</span>
                </nav>

                <h1 className={styles.title}>Términos y condiciones</h1>

                <div className={styles.card}>
                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Datos del vendedor</h2>
                        <p>Razón social: Eman. CUIT: 27-34970222-9. Domicilio: Entre Ríos 1529, López, Santa Fe.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Precios</h2>
                        <p>Todos los precios publicados son en pesos argentinos e incluyen IVA. El precio vigente al momento de confirmar tu pedido es el que se aplicará a tu compra.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Disponibilidad de stock</h2>
                        <p>Los productos están sujetos a disponibilidad de stock. En caso de no poder cumplir con un pedido, te contactaremos para ofrecerte una alternativa o el reembolso correspondiente.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Derecho a arrepentimiento</h2>
                        <p>De acuerdo a la Ley 24.240, tenés 10 días hábiles desde la recepción del producto para ejercer el derecho a arrepentimiento sin costo ni necesidad de justificación.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Comprobante fiscal</h2>
                        <p>Por cada compra se emite el comprobante fiscal correspondiente, que será enviado al email registrado en el pedido.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Legislación aplicable</h2>
                        <p>Estas condiciones se rigen por las leyes de la República Argentina, en particular la Ley 24.240 de Defensa del Consumidor.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;