import { useSearchParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './OrderPending.module.css'

const OrderPending = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    const navigate = useNavigate()

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Orden Pendiente' },
            ]} />

            <div className={styles.content}>
                <h1 className={styles.title}>Tu pago está en revisión</h1>
                <p className={styles.text}>
                    Estamos procesando tu pago. Te vamos a avisar por email en cuanto se confirme.
                </p>
                {orderId && <p className={styles.orderId}>Número de orden: {orderId}</p>}
                <button className={styles.btn} onClick={() => navigate('/')}>
                    Volver a la tienda
                </button>
            </div>
        </div>
    )
}

export default OrderPending