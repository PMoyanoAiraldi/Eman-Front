import styles from './Strip.module.css'

const Strip = () => {
    return (
        <div className={styles.strip}>
        <span>Envío gratis +$50.000</span>
        <span className={styles.dot}>•</span>
        <span>Devoluciones sin costo</span>
        <span className={styles.dot}>•</span>
        <span>Nuevos ingresos cada semana</span>
        </div>
    )
}

export default Strip