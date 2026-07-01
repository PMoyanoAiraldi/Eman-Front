import { useSearchParams, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb'
import styles from './OrderConfirm.module.css'

const OrderConfirm = () => {
    const [searchParams] = useSearchParams()
    const orderId = searchParams.get('orderId')
    const navigate = useNavigate()

    return (
        <div className={styles.page}>
            <Breadcrumb items={[
                { label: 'Inicio', path: '/' },
                { label: 'Orden Confirmada' },
            ]} />

            <div className={styles.content}>
                <h1 className={styles.title}>¡Gracias por tu compra!</h1>
                <p className={styles.text}>
                    Tu pago fue aprobado y ya estamos preparando tu pedido.
                </p>
                {orderId && <p className={styles.orderId}>Número de orden: {orderId}</p>}
                <button className={styles.btn} onClick={() => navigate('/')}>
                    Volver a la tienda
                </button>
            </div>
        </div>
    )
}

export default OrderConfirm