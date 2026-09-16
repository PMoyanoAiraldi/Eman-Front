import styles from './Strip.module.css'

const Strip = () => {
    return (
        <div className={styles.strip}>
        <span>Envíos a todo el país</span>
        <span className={styles.dot}>•</span>
        <span>Calidad garantizada</span>
        <span className={styles.dot}>•</span>
        <span>Nuevos ingresos cada semana</span>
        </div>
    )
}

export default Strip