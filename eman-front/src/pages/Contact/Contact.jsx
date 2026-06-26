import { useRef, useState } from "react";
import { Link } from 'react-router-dom'
import emailjs from "@emailjs/browser";
import Toast from "../../components/Toast/Toast";
import styles from "./Contact.module.css";

const Contact = () => {
    const form = useRef(null);

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const hideToast = () => setToast(null);

    const sendEmail =async (e) => {
        e.preventDefault();

        const data = new FormData(form.current);
        const name = data.get("name").trim();
        const message = data.get("message").trim();

        if (name.length < 3) {
            setToast({ type: "error", message: "Ingresá tu nombre completo." });
            return;
        }

        if (message.length < 10) {
            setToast({ type: "error", message: "El mensaje es demasiado corto." });
            return;
        }

        setLoading(true);

        try {
            await emailjs.sendForm(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,//  reemplazar por tu Service ID real
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,    //  reemplazar por tu Template ID real  
                form.current,
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY     // reemplazar por tu Public Key (API Key)
            )
            setToast({
                    type: "success",
                    message: "Recibimos tu consulta. Te responderemos a la brevedad.",
                });

            form.current.reset();
            } catch (error) {
                console.error(error);

                setToast({
                    type: "error",
                    message: "No pudimos enviar tu consulta. Intentá nuevamente.",
                });
            } finally {
            setLoading(false);
        }
    };

        return (
            <>
            <div className={styles.container}>
            <div className={styles.containerContact}>
            <nav className={styles.breadcrumb}>
                <Link to="/">Inicio</Link>
                <span> / </span>
                <span>Contacto</span>
            </nav>
            <h1 className={styles.titleContact}>Envianos tu consulta</h1>
            <form ref={form} onSubmit={sendEmail} className={styles.form}>
            <input
                className={styles.input}
                type="text"
                name="name"
                placeholder="Nombre y Apellido"
                required
            />
            <input
                className={styles.input}
                type="email"
                name="email"
                placeholder="Tu email"
                required
            />
            <input
                className={styles.input}
                type="text"
                name="locality"
                placeholder="Localidad"
                required
            />
            <textarea
                className={styles.input}
                name="message"
                placeholder="Escribí tu mensaje..."
                required
            />
            <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
            </button>
            </form>
            <Toast toast={toast} onHide={hideToast} />
            </div>
            </div>
        </>
        );
    };

    export default Contact;
