import styles from './WhatsAppButton.module.css'

const WhatsAppButton = () => {
    const numero = "5493404535333" // número personal de Andre 
    const mensaje = "Hola! Me gustaría consultar sobre un producto."

    return (
        <a
        href={`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
        aria-label="Contactar por WhatsApp"
        >
        <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        width="32"
        height="32"
        />
        </a>
    )
    }

export default WhatsAppButton