import { Link } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import styles from "../../styles/InfoPage.module.css";


const Terms = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <Breadcrumb items={[
                    { label: 'Inicio', path: '/' }, 
                    { label: 'Terminos y condiciones' }]} 
                />

                <h1 className={styles.title}>Términos y condiciones</h1>

                <div className={styles.card}>
                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Datos del vendedor</h2>
                        <p>Titular: Andrea Soledad Mélica. Nombre comercial: Eman. CUIT: 27-34970222-9. Domicilio: Entre Ríos 1529, López, Santa Fe.</p>
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
                        <h2 className={styles.subtitle}>Derecho de arrepentimiento</h2>
                        <p>
                            De acuerdo a la Ley 24.240, tenés 10 días corridos desde la recepción del producto para ejercer el derecho de arrepentimiento, sin costo y sin necesidad de justificación, mediante el{" "}
                            <Link to="/arrepentimiento" className={styles.link}>botón de arrepentimiento</Link>.
                            Más información en{" "}
                            <Link to="/returns" className={styles.link}>Devoluciones y cambios</Link>.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Comprobante fiscal</h2>
                        <p>Por cada compra se emite el comprobante fiscal correspondiente, que será enviado al email registrado en el pedido.</p>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.subtitle}>Atención al consumidor</h2>
                        <p>
                            Podés comunicarte por{" "}
                            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={styles.link}>WhatsApp</a>
                            {" "}o desde el formulario de contacto. Horario de atención: Lunes a Sábado de 10 a 12 hs y de 17 a 20 hs. Las consultas recibidas fuera de ese horario se responden el siguiente día hábil.
                        </p>
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